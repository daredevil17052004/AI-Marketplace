import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
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

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
}


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


export async function logoutUser(userId:string): Promise<void> {
        await db
            .update(users)
            .set({ currentRefreshTokenId: null})
            .where(eq(users.id, userId))
}