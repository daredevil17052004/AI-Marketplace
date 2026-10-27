import { getAccessToken, getRefreshToken, saveTokens, clearTokens, StoredUser } from "./auth";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

const BASE_URL = typeof window === "undefined"
  ? `${BACKEND_URL}/api`
  : (process.env.NEXT_PUBLIC_API_URL || "/api");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SchemaField {
  name: string;
  label?: string;
  type: "text" | "number" | "boolean" | "textarea" | "select";
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select
  placeholder?: string;
}

export interface InputSchema {
  fields: SchemaField[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string;
  creditCost: number;
  inputSchema?: InputSchema;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  userId?: string;
  userEmail?: string;
  agentId: string;
  agentName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  inputPayload?: Record<string, unknown>;
  outputResult?: string | Record<string, unknown>;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

export interface CreditLedgerItem {
  id: string;
  amount: number;
  reason: string;
  jobId?: string | null;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: "user" | "admin";
  creditsBalance: number;
  createdAt: string;
}

// ─── Request Helper with Auto-Refresh ──────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized → attempt token refresh
  if (res.status === 401 && !path.includes("/auth/")) {
    const refreshTokenVal = getRefreshToken();
    if (refreshTokenVal) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenVal }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.accessToken) {
            saveTokens(data.accessToken, refreshTokenVal);
            headers["Authorization"] = `Bearer ${data.accessToken}`;
            res = await fetch(url, { ...options, headers });
          }
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      else if (body?.message) message = body.message;
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Agent Endpoints ──────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  return request<Agent[]>("/agents");
}

export async function fetchAgent(id: string): Promise<Agent> {
  return request<Agent>(`/agents/${id}`);
}

// ─── Job Endpoints ────────────────────────────────────────────────────────────

export async function fetchJobs(): Promise<Job[]> {
  return request<Job[]>("/jobs");
}

export async function submitJob(agentId: string, inputPayload: Record<string, unknown>): Promise<{ id: string }> {
  return request<{ id: string }>("/jobs", {
    method: "POST",
    body: JSON.stringify({ agentId, inputPayload }),
  });
}

export async function fetchJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}

// ─── Credits Endpoints ────────────────────────────────────────────────────────

export async function fetchCreditBalance(): Promise<{ balance: number }> {
  return request<{ balance: number }>("/credits/balance");
}

export async function fetchCreditLedger(): Promise<CreditLedgerItem[]> {
  return request<CreditLedgerItem[]>("/credits/ledger");
}

export async function topUpCredits(amount: number): Promise<{ balance: number }> {
  return request<{ balance: number }>("/credits/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

export async function fetchAdminAgents(): Promise<Agent[]> {
  return request<Agent[]>("/admin/agents");
}

export async function createAdminAgent(data: Partial<Agent>): Promise<Agent> {
  return request<Agent>("/admin/agents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminAgent(id: string, data: Partial<Agent>): Promise<Agent> {
  return request<Agent>(`/admin/agents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function toggleAdminAgent(id: string, isActive: boolean): Promise<Agent> {
  return request<Agent>(`/admin/agents/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteAdminAgent(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/admin/agents/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminJobs(): Promise<Job[]> {
  return request<Job[]>("/admin/jobs");
}

export async function fetchAdminUsers(): Promise<UserSummary[]> {
  return request<UserSummary[]>("/admin/users");
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/auth/logout", { method: "POST" });
  } catch {
    // ignore network errors on logout — tokens are cleared regardless
  } finally {
    clearTokens();
  }
}

export interface UserProfileData {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  isGoogleUser: boolean;
}

export async function fetchUserProfile(): Promise<UserProfileData> {
  return request<UserProfileData>("/auth/me");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

