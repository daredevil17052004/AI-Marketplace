// all jwt logic lives here. nothing else in the app imports jsonwebtoken


// jwt primer :
// a jwt has 3 parts separated by dots;

// Access Token ( short-lived, 15min)
// -- stateless 
// sent with every api request in the authentication header 

// Refresh Token( long-lived, 7 days)
// -- stored in out db 
// - used only to get a new access token when it expries
// can be revoked instantly by clearing the db column

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errors.js";


export interface AccessTokenPayload{
    userId: string;
    email: string;
    role: "user" | "admin";
}

export interface RefreshTokenPayload{
    userId:string;
    // This ID matches the currentRefreshTokenId stored in the users table.
    // On refresh, we verify these match - if someone steals an old refresh
    // token after logout, this check invalidates it.
    tokenId: string;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function signAccessToken(payload: AccessTokenPayload): string{
    const secret = process.env.JWT_ACCESS_SECRET;
    if(!secret) throw new Error("JWT_ACCESS_SECRET not set");

    return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY});
}

export function signRefreshToken(payload: RefreshTokenPayload):string{
    const secret = process.env.JWT_REFRESH_SECRET;
    if(!secret) throw new Error("JWT_REFRESG_SECRET not set");
    
    return jwt.sign(payload, secret, {expiresIn: REFRESH_TOKEN_EXPIRY});
}


export function verifyAccessToken(token:string): AccessTokenPayload{
    const secret = process.env.JWT_ACCESS_SECRET;
    if(!secret) throw new Error("JWT_ACCESS_SECRET not set");

    try{
        return jwt.verify(token, secret) as AccessTokenPayload;
    }catch{
        // if the token is expired, malformd or has a bad signature
        throw new UnauthorizedError("Invalid or expired refresh token");
    }
}


export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not set");
 
  try {
    return jwt.verify(token, secret) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}