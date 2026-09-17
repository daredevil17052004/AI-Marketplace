// src/lib/auth.ts
// Token storage helpers — all token I/O is centralised here.

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/** Persist both tokens in localStorage after a successful auth call. */
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/** Read the stored access token (null if not present). */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Read the stored refresh token (null if not present). */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Remove both tokens — call on logout. */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Returns true when an access token exists in storage. */
export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}
