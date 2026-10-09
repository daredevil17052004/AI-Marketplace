const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_info";

const isBrowser = typeof window !== "undefined";

export interface StoredUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
  if (isBrowser) {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string, user?: StoredUser): void {
  inMemoryAccessToken = accessToken;
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getSavedUser(): StoredUser | null {
  if (!isBrowser) return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  inMemoryAccessToken = null;
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}