// src/services/adminService.ts
import { eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents, jobs, users, creditsLedger } from "../db/schema.js";
import { NotFoundError } from "../lib/errors.js";

// ─── Agent Management ────────────────────────────────────────────────────────

export async function listAllAgents() {
  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function createAgent(
  data: {
    name: string;
    description: string;
    systemPrompt: string;
    inputSchema: Record<string, unknown>;
    creditCost?: number;
    isActive?: boolean;
  },
  adminUserId: string
) {
  const [agent] = await db
    .insert(agents)
    .values({
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt,
      inputSchema: data.inputSchema,
      creditCost: data.creditCost ?? 1,
      isActive: data.isActive ?? true,
      createdBy: adminUserId,
    })
    .returning();
  return agent;
}

export async function updateAgent(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    inputSchema: Record<string, unknown>;
    creditCost: number;
    isActive: boolean;
  }>
) {
  const [updated] = await db
    .update(agents)
    .set(data)
    .where(eq(agents.id, id))
    .returning();
  if (!updated) throw new NotFoundError("Agent");
  return updated;
}

export async function toggleAgent(id: string, isActive: boolean) {
  const [updated] = await db
    .update(agents)
    .set({ isActive })
    .where(eq(agents.id, id))
    .returning();
  if (!updated) throw new NotFoundError("Agent");
  return updated;
}

export async function deleteAgent(id: string) {
  const [deleted] = await db.delete(agents).where(eq(agents.id, id)).returning({ id: agents.id });
  if (!deleted) throw new NotFoundError("Agent");
  return { success: true };
}

// ─── Job Monitoring ──────────────────────────────────────────────────────────

export async function listAllJobs(limit = 100) {
  return db
    .select({
      id: jobs.id,
      userId: jobs.userId,
      agentId: jobs.agentId,
      status: jobs.status,
      inputPayload: jobs.inputPayload,
      outputResult: jobs.outputResult,
      errorMessage: jobs.errorMessage,
      createdAt: jobs.createdAt,
      completedAt: jobs.completedAt,
      durationMs: jobs.durationMs,
    })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(limit);
}

// ─── User Management ─────────────────────────────────────────────────────────

export async function listAllUsers() {
  // Fetch all users with their computed credit balance
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  // Batch-fetch balances
  const balances = await db
    .select({
      userId: creditsLedger.userId,
      balance: sql<number>`coalesce(sum(${creditsLedger.amount}), 0)`,
    })
    .from(creditsLedger)
    .groupBy(creditsLedger.userId);

  const balanceMap = new Map(balances.map((b) => [b.userId, b.balance]));

  return allUsers.map((u) => ({
    ...u,
    creditsBalance: balanceMap.get(u.id) ?? 0,
  }));
}
