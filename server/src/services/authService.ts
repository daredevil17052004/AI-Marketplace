import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { ConflictError, UnauthorizedError } from "../lib/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens.js";
import { randomUUID, sign } from "node:crypto";

const SALT_ROUNDS = 10;

export interface AuthResult{
    accessToken: string;
    refreshToken: string;
    user:{
        id: string;
        email: string;
        role: "user" | "admin";
    };
}

export async function reqisterUser(
    email: string,
    password: string
): Promise<AuthResult> {

    const existing = await db
        .select({id: users.id})
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
    
    if(existing.length > 0){
        throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const refreshTokenId = randomUUID();

    const [newUser] = await db 
        .insert(users)
        .values({
            email:email.toLowerCase(),
            passwordHash,
            currentRefreshTokenId: refreshTokenId,
        })
        .returning({
            id: users.id,
            email: users.email,
            role: users.role
        });

  // 5. Sign both tokens
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