import { getAccessToken, getRefreshToken } from "./auth";

const BASE_URL = typeof window === "undefined"
  ? "http://localhost:4000/api"   // server-side: direct
  : "/api";    
// ─── Types ────────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  category?: string;
  tags?: string[];
}

export interface Job {
  id: string;
  agentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  inputPayload?: unknown;
  outputResult?: string;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: { id: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the default headers, including Authorization when a token is present.
 */
function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Thin wrapper around fetch.
 * Throws a descriptive Error when the response status is not ok.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers as Record<string, string>),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors — keep the status-based message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── Agent endpoints ──────────────────────────────────────────────────────────

/** GET /api/agents — returns the full list of available agents. */
export function fetchAgents(): Promise<Agent[]> {
  return request<Agent[]>("/agents");
}

/** GET /api/agents/:id — returns a single agent's details. */
export function fetchAgent(id: string): Promise<Agent> {
  return request<Agent>(`/agents/${id}`);
}

// ─── Job endpoints ────────────────────────────────────────────────────────────

/** POST /api/jobs — enqueue a new job for the given agent. */
export function submitJob(
  agentId: string,
  inputPayload: unknown
): Promise<{ id: string }> {
  return request<{ id: string }>("/jobs", {
    method: "POST",
    body: JSON.stringify({ agentId, inputPayload }),
  });
}

/** GET /api/jobs/:id — poll the current state of a job. */
export function fetchJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

/** POST /api/auth/login — exchange credentials for tokens. */
export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/register — create a new account and receive tokens. */
export function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/logout — invalidate the session on the server. */
export function logout(): Promise<void> {
  return request<void>("/auth/logout", { method: "POST" });
}

/** POST /api/auth/refresh — exchange a refresh token for a new access token. */
export function refreshToken(): Promise<AuthResponse> {
  // The refresh token is sent in the body because the access token may be expired.
  const token = getRefreshToken();
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
}
