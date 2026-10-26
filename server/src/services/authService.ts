import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db/index.js";
import { users, creditsLedger } from "../db/schema.js";
import { ConflictError, UnauthorizedError } from "../lib/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens.js";

const SALT_ROUNDS = 10;

export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: "user" | "admin";
    };
}

// ─── Helper: mint tokens and return an AuthResult ─────────────────────────────

async function issueTokens(user: { id: string; email: string; role: "user" | "admin" }): Promise<AuthResult> {
    const refreshTokenId = randomUUID();

    await db
        .update(users)
        .set({ currentRefreshTokenId: refreshTokenId })
        .where(eq(users.id, user.id));

    const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = signRefreshToken({
        userId: user.id,
        tokenId: refreshTokenId,
    });

    return { accessToken, refreshToken, user };
}

// ─── Email/Password Auth ──────────────────────────────────────────────────────

export async function registerUser(
    email: string,
    password: string
): Promise<AuthResult> {
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    if (existing.length > 0) {
        throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const refreshTokenId = randomUUID();

    const [newUser] = await db
        .insert(users)
        .values({
            email: email.toLowerCase(),
            passwordHash,
            currentRefreshTokenId: refreshTokenId,
        })
        .returning({
            id: users.id,
            email: users.email,
            role: users.role,
        });

    // Provide default signup bonus credits
    await db.insert(creditsLedger).values({
        userId: newUser.id,
        amount: 100,
        reason: "signup_bonus",
    });

    const accessToken = signAccessToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
    });

    const refreshToken = signRefreshToken({
        userId: newUser.id,
        tokenId: refreshTokenId,
    });

    return { accessToken, refreshToken, user: newUser };
}

export async function loginUser(
    email: string,
    password: string
): Promise<AuthResult> {
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            role: users.role,
            currentRefreshTokenId: users.currentRefreshTokenId,
        })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const comparePasswords = await bcrypt.compare(password, user.passwordHash);

    if (!comparePasswords) {
        throw new UnauthorizedError("Invalid email or password");
    }

    return issueTokens({ id: user.id, email: user.email, role: user.role });
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new UnauthorizedError("Invalid Google token");
    }

    const email = payload.email.toLowerCase();

    // Find or create the user
    const [existingUser] = await db
        .select({ id: users.id, email: users.email, role: users.role })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser) {
        return issueTokens(existingUser);
    }

    // New user via Google — create with a placeholder password hash (they can never log in
    // with email+password unless they set a password later) and give signup credits.
    const [newUser] = await db
        .insert(users)
        .values({
            email,
            // Irreversible hash — effectively no password for OAuth users
            passwordHash: await bcrypt.hash(randomUUID(), SALT_ROUNDS),
        })
        .returning({ id: users.id, email: users.email, role: users.role });

    await db.insert(creditsLedger).values({
        userId: newUser.id,
        amount: 100,
        reason: "signup_bonus",
    });

    return issueTokens(newUser);
}

// ─── Token Management ─────────────────────────────────────────────────────────

export async function refreshAccessToken(
    refreshToken: string
): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            currentRefreshTokenId: users.currentRefreshTokenId,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

    if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    if (user.currentRefreshTokenId !== payload.tokenId) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return { accessToken };
}

export async function logoutUser(userId: string): Promise<void> {
    await db
        .update(users)
        .set({ currentRefreshTokenId: null })
        .where(eq(users.id, userId));
}