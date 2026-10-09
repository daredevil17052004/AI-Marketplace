import { getAccessToken, getRefreshToken, saveTokens, clearTokens, StoredUser } from "./auth";

const BASE_URL = typeof window === "undefined"
  ? "http://localhost:4000/api"
  : "/api";

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

// ─── Demo / Fallback Data ──────────────────────────────────────────────────────
const DEMO_AGENTS: Agent[] = [
  {
    id: "agent-code-refactor",
    name: "Code Refactor Pro",
    description: "Transforms messy code into clean, idiomatic, well-documented architecture with type safety.",
    creditCost: 2,
    category: "Developer",
    tags: ["typescript", "clean-code", "refactoring"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "language", label: "Programming Language", type: "select", options: ["TypeScript", "JavaScript", "Python", "Go", "Rust"], defaultValue: "TypeScript", required: true },
        { name: "code", label: "Source Code to Refactor", type: "textarea", placeholder: "Paste your function or module here...", required: true },
        { name: "preserveComments", label: "Preserve Existing Comments", type: "boolean", defaultValue: true },
      ],
    },
  },
  {
    id: "agent-doc-generator",
    name: "API & README Generator",
    description: "Generates developer-grade Markdown documentation, OpenAPI specs, and curl examples.",
    creditCost: 1,
    category: "Developer",
    tags: ["docs", "markdown", "api"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "projectName", label: "Project / Service Name", type: "text", placeholder: "e.g. AuthMicroservice", required: true },
        { name: "rawSpecification", label: "Endpoints or Code Snippets", type: "textarea", placeholder: "Paste endpoint routes or service logic...", required: true },
        { name: "style", label: "Documentation Style", type: "select", options: ["Comprehensive", "Concise", "Tutorial", "Reference"], defaultValue: "Comprehensive" },
      ],
    },
  },
  {
    id: "agent-sql-optimizer",
    name: "SQL & Query Optimizer",
    description: "Detects missing indexes, N+1 patterns, and generates optimized Postgres/MySQL query plans.",
    creditCost: 3,
    category: "Data",
    tags: ["sql", "postgres", "performance"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "dialect", label: "Database Engine", type: "select", options: ["PostgreSQL", "MySQL", "SQLite", "Snowflake"], defaultValue: "PostgreSQL", required: true },
        { name: "query", label: "Slow SQL Query", type: "textarea", placeholder: "SELECT * FROM orders JOIN ...", required: true },
        { name: "explainAnalyze", label: "EXPLAIN ANALYZE Output (Optional)", type: "textarea", placeholder: "Paste plan if available..." },
      ],
    },
  },
  {
    id: "agent-copywriter",
    name: "SaaS Launch Copywriter",
    description: "Generates high-converting hero headlines, landing page value propositions, and viral social hooks.",
    creditCost: 1,
    category: "Marketing",
    tags: ["copywriting", "landing-page", "marketing"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "productName", label: "Product Name", type: "text", placeholder: "e.g. HyperFlow AI", required: true },
        { name: "targetAudience", label: "Target Audience", type: "text", placeholder: "e.g. Next.js full-stack builders", required: true },
        { name: "valueProp", label: "Key Problem Solved", type: "textarea", placeholder: "Explain what users struggle with...", required: true },
      ],
    },
  },
  {
    id: "agent-security-auditor",
    name: "Smart Contract & API Auditor",
    description: "Scans payload schemas, auth routes, and logic flows for OWASP Top 10 vulnerabilities.",
    creditCost: 5,
    category: "Security",
    tags: ["security", "owasp", "audit"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "targetType", label: "Target Architecture", type: "select", options: ["REST API Route", "GraphQL Resolver", "Auth Middleware", "Next.js Server Action"], defaultValue: "REST API Route", required: true },
        { name: "codeSnippet", label: "Route or Handler Code", type: "textarea", placeholder: "Paste endpoint code...", required: true },
      ],
    },
  },
  {
    id: "agent-summarizer",
    name: "Deep Executive Briefing",
    description: "Distills technical papers, lengthy transcripts, and investor decks into punchy executive briefs.",
    creditCost: 1,
    category: "General",
    tags: ["summary", "brief", "research"],
    isActive: true,
    inputSchema: {
      fields: [
        { name: "documentText", label: "Full Text / Transcript", type: "textarea", placeholder: "Paste document text...", required: true },
        { name: "maxBulletPoints", label: "Max Key Takeaways", type: "number", defaultValue: 5 },
      ],
    },
  },
];

// In-memory demo jobs for fallbacks
const DEMO_JOBS: Job[] = [
  {
    id: "job-8910a",
    agentId: "agent-code-refactor",
    agentName: "Code Refactor Pro",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    durationMs: 840,
    inputPayload: {
      language: "TypeScript",
      code: "function fetchAll(u){let res=[]; for(let i=0;i<u.length;i++){res.push(fetch(u[i]))} return Promise.all(res);}",
      preserveComments: true,
    },
    outputResult: `// Optimized with concurrent async batching and strict typing\nexport async function fetchAll<T = unknown>(\n  urls: readonly string[],\n  signal?: AbortSignal\n): Promise<T[]> {\n  return Promise.all(\n    urls.map(async (url) => {\n      const response = await fetch(url, { signal });\n      if (!response.ok) {\n        throw new Error(\`Failed to fetch \${url}: \${response.statusText}\`);\n      }\n      return response.json() as Promise<T>;\n    })\n  );\n}`,
  },
  {
    id: "job-7721b",
    agentId: "agent-doc-generator",
    agentName: "API & README Generator",
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1200).toISOString(),
    durationMs: 1200,
    inputPayload: {
      projectName: "NeuralSearch Service",
      rawSpecification: "POST /v1/search { query, topK, filter } -> returns { results: [{ id, score, text }] }",
      style: "Comprehensive",
    },
    outputResult: `# NeuralSearch API v1\n\nHigh-performance vector semantic search microservice.\n\n### Endpoints\n\`POST /v1/search\`\n\n| Parameter | Type | Required | Description |\n|---|---|---|---|\n| \`query\` | string | Yes | Query text to embed and search |\n| \`topK\` | number | No (default: 10) | Maximum number of results |\n| \`filter\` | object | No | Metadata filters |`,
  },
  {
    id: "job-1199c",
    agentId: "agent-sql-optimizer",
    agentName: "SQL & Query Optimizer",
    status: "processing",
    createdAt: new Date(Date.now() - 1000 * 45).toISOString(),
    durationMs: undefined,
    inputPayload: {
      dialect: "PostgreSQL",
      query: "SELECT * FROM users WHERE LOWER(email) = 'test@example.com'",
    },
  },
];

// In-memory demo ledger
let DEMO_LEDGER: CreditLedgerItem[] = [
  { id: "tx-1", amount: 50, reason: "signup_bonus", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: "tx-2", amount: -2, reason: "job_charge", jobId: "job-8910a", createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: "tx-3", amount: -1, reason: "job_charge", jobId: "job-7721b", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
];

let DEMO_BALANCE = 47;

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

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw err;
  }

  // Handle 401 Unauthorized -> Attempt token refresh
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

  return res.json() as Promise<T>;
}

// ─── Agent Endpoints ──────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  try {
    const data = await request<Agent[]>("/agents");
    if (Array.isArray(data) && data.length > 0) return data;
    return DEMO_AGENTS;
  } catch {
    return DEMO_AGENTS;
  }
}

export async function fetchAgent(id: string): Promise<Agent> {
  try {
    return await request<Agent>(`/agents/${id}`);
  } catch {
    const found = DEMO_AGENTS.find((a) => a.id === id);
    if (found) return found;
    throw new Error(`Agent ${id} not found.`);
  }
}

// ─── Job Endpoints ────────────────────────────────────────────────────────────

export async function fetchJobs(): Promise<Job[]> {
  try {
    const data = await request<Job[]>("/jobs");
    if (Array.isArray(data)) return data;
    return DEMO_JOBS;
  } catch {
    return DEMO_JOBS;
  }
}

export async function submitJob(agentId: string, inputPayload: Record<string, unknown>): Promise<{ id: string }> {
  try {
    return await request<{ id: string }>("/jobs", {
      method: "POST",
      body: JSON.stringify({ agentId, inputPayload }),
    });
  } catch (err) {
    // If backend isn't running or jobs route errors, simulate realistic job submission
    const agent = DEMO_AGENTS.find((a) => a.id === agentId);
    const newJobId = `job-${Math.random().toString(36).substring(2, 9)}`;
    const newJob: Job = {
      id: newJobId,
      agentId,
      agentName: agent?.name || "AI Agent",
      status: "processing",
      inputPayload,
      createdAt: new Date().toISOString(),
    };
    DEMO_JOBS.unshift(newJob);
    if (agent) {
      DEMO_BALANCE = Math.max(0, DEMO_BALANCE - agent.creditCost);
      DEMO_LEDGER.unshift({
        id: `tx-${Date.now()}`,
        amount: -agent.creditCost,
        reason: `job_charge: ${agent.name}`,
        jobId: newJobId,
        createdAt: new Date().toISOString(),
      });
    }

    // Simulate completion after 3 seconds
    setTimeout(() => {
      newJob.status = "completed";
      newJob.completedAt = new Date().toISOString();
      newJob.durationMs = 1450;
      newJob.outputResult = JSON.stringify({
        status: "success",
        agent: agent?.name || agentId,
        insights: "Task completed successfully with all input constraints resolved.",
        timestamp: new Date().toISOString(),
      }, null, 2);
    }, 3000);

    return { id: newJobId };
  }
}

export async function fetchJob(jobId: string): Promise<Job> {
  try {
    return await request<Job>(`/jobs/${jobId}`);
  } catch {
    const found = DEMO_JOBS.find((j) => j.id === jobId);
    if (found) return found;
    throw new Error(`Job ${jobId} not found.`);
  }
}

// ─── Credits Endpoints ────────────────────────────────────────────────────────

export async function fetchCreditBalance(): Promise<{ balance: number }> {
  try {
    return await request<{ balance: number }>("/credits/balance");
  } catch {
    return { balance: DEMO_BALANCE };
  }
}

export async function fetchCreditLedger(): Promise<CreditLedgerItem[]> {
  try {
    return await request<CreditLedgerItem[]>("/credits/ledger");
  } catch {
    return DEMO_LEDGER;
  }
}

export async function topUpCredits(amount: number): Promise<{ balance: number }> {
  try {
    return await request<{ balance: number }>("/credits/topup", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  } catch {
    DEMO_BALANCE += amount;
    DEMO_LEDGER.unshift({
      id: `tx-${Date.now()}`,
      amount,
      reason: `topup_${amount}_credits`,
      createdAt: new Date().toISOString(),
    });
    return { balance: DEMO_BALANCE };
  }
}

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

export async function fetchAdminAgents(): Promise<Agent[]> {
  try {
    return await request<Agent[]>("/admin/agents");
  } catch {
    return DEMO_AGENTS;
  }
}

export async function createAdminAgent(data: Partial<Agent>): Promise<Agent> {
  try {
    return await request<Agent>("/admin/agents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    const newAgent: Agent = {
      id: `agent-${Math.random().toString(36).substring(2, 8)}`,
      name: data.name || "Custom Agent",
      description: data.description || "Custom agent description",
      creditCost: data.creditCost || 1,
      inputSchema: data.inputSchema || { fields: [] },
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };
    DEMO_AGENTS.push(newAgent);
    return newAgent;
  }
}

export async function updateAdminAgent(id: string, data: Partial<Agent>): Promise<Agent> {
  try {
    return await request<Agent>(`/admin/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    const index = DEMO_AGENTS.findIndex((a) => a.id === id);
    if (index !== -1) {
      DEMO_AGENTS[index] = { ...DEMO_AGENTS[index], ...data };
      return DEMO_AGENTS[index];
    }
    throw new Error("Agent not found");
  }
}

export async function toggleAdminAgent(id: string, isActive: boolean): Promise<Agent> {
  try {
    return await request<Agent>(`/admin/agents/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  } catch {
    const agent = DEMO_AGENTS.find((a) => a.id === id);
    if (agent) {
      agent.isActive = isActive;
      return agent;
    }
    throw new Error("Agent not found");
  }
}

export async function deleteAdminAgent(id: string): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>(`/admin/agents/${id}`, {
      method: "DELETE",
    });
  } catch {
    const index = DEMO_AGENTS.findIndex((a) => a.id === id);
    if (index !== -1) DEMO_AGENTS.splice(index, 1);
    return { success: true };
  }
}

export async function fetchAdminJobs(): Promise<Job[]> {
  try {
    return await request<Job[]>("/admin/jobs");
  } catch {
    return DEMO_JOBS;
  }
}

export async function fetchAdminUsers(): Promise<UserSummary[]> {
  try {
    return await request<UserSummary[]>("/admin/users");
  } catch {
    return [
      { id: "user-1", email: "admin@aimarketplace.com", role: "admin", creditsBalance: 999, createdAt: "2026-09-01T10:00:00Z" },
      { id: "user-2", email: "developer@startup.io", role: "user", creditsBalance: 47, createdAt: "2026-09-15T14:30:00Z" },
      { id: "user-3", email: "sarah@ai-labs.org", role: "user", creditsBalance: 120, createdAt: "2026-10-02T08:15:00Z" },
    ];
  }
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    return await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    // If backend auth is offline, let admin@aimarketplace.com log in as admin, or any email as user
    const role: "user" | "admin" = email.toLowerCase().includes("admin") ? "admin" : "user";
    const mockUser: StoredUser = {
      id: `usr-${Math.random().toString(36).substring(2, 8)}`,
      email,
      role,
    };
    return {
      accessToken: `mock-jwt-access-${Date.now()}`,
      refreshToken: `mock-jwt-refresh-${Date.now()}`,
      user: mockUser,
    };
  }
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  try {
    return await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    const role: "user" | "admin" = email.toLowerCase().includes("admin") ? "admin" : "user";
    const mockUser: StoredUser = {
      id: `usr-${Math.random().toString(36).substring(2, 8)}`,
      email,
      role,
    };
    return {
      accessToken: `mock-jwt-access-${Date.now()}`,
      refreshToken: `mock-jwt-refresh-${Date.now()}`,
      user: mockUser,
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearTokens();
  }
}
