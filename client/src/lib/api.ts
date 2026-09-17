// src/lib/api.ts
// Single file that owns every fetch call to the Express backend.
// Nothing else in the app imports fetch directly.

import { getAccessToken, getRefreshToken, clearTokens } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore JSON parse failure — keep default message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  description: string;
  creditCost: number;
}

export interface Job {
  id: string;
  agentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  inputPayload: unknown;
  outputResult?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

// ---------------------------------------------------------------------------
// Agent endpoints
// ---------------------------------------------------------------------------

/** GET /api/agents — list all available agents. */
export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/api/agents`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Agent[]>(res);
}

/** GET /api/agents/:id — fetch a single agent by id. */
export async function fetchAgent(id: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/api/agents/${id}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Agent>(res);
}

// ---------------------------------------------------------------------------
// Job endpoints
// ---------------------------------------------------------------------------

/** POST /api/jobs — submit a job and return the created job record. */
export async function submitJob(
  agentId: string,
  inputPayload: unknown
): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ agentId, inputPayload }),
  });
  return handleResponse<Job>(res);
}

/** GET /api/jobs/:id — fetch a job by id (REST, not WebSocket). */
export async function fetchJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return handleResponse<Job>(res);
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/** POST /api/auth/login — exchange credentials for tokens. */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

/** POST /api/auth/register — create account and return tokens. */
export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

/** POST /api/auth/logout — invalidate the session on the server. */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    await handleResponse<void>(res);
  } finally {
    clearTokens();
  }
}

/** POST /api/auth/refresh — exchange refresh token for a new access token. */
export async function refreshToken(): Promise<AuthResponse> {
  const storedRefreshToken = getRefreshToken();
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });
  return handleResponse<AuthResponse>(res);
}
