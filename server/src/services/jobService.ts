// src/services/jobService.ts
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { jobs, creditsLedger, agents } from "../db/schema.js";
import { enqueueAgentJob } from "../lib/queue.js";
import { InsufficientCreditsError, NotFoundError } from "../lib/errors.js";
import { getAgentById } from "./agentService.js";
import logger from "../lib/logger.js";

export async function createJob(userId: string, agentId: string, inputPayload: Record<string, unknown>) {

  // Step 1: get agent (throws NotFoundError if missing)
  const agent = await getAgentById(agentId);

  // Step 2: check user's credit balance
  // SUM all ledger rows for this user
  const balanceResult = await db
    .select({ balance: sql<number>`sum(${creditsLedger.amount})` })
    .from(creditsLedger)
    .where(eq(creditsLedger.userId, userId));

  const balance = balanceResult[0]?.balance ?? 0;

  if (balance < agent.creditCost) {
    logger.warn({ userId, agentId, requiredCredits: agent.creditCost, currentCredits: balance }, 'Job creation blocked: Insufficient credits');
    throw new InsufficientCreditsError();
  }

  // Step 3: transaction — insert job + debit credits atomically
  const [newJob] = await db.transaction(async (tx) => {
    const [job] = await tx
      .insert(jobs)
      .values({
        userId,
        agentId,
        inputPayload,
        status: "pending",
      })
      .returning({ id: jobs.id });

    await tx.insert(creditsLedger).values({
      userId,
      amount: -agent.creditCost, // negative — this is a debit
      reason: "job_charge",
      jobId: job.id,
    });

    return [job];
  });

  // Step 4: enqueue AFTER the DB write succeeds
  await enqueueAgentJob({
    jobId: newJob.id,
    agentId,
    userId,
    inputPayload,
  });

  logger.info({ jobId: newJob.id, userId, agentId }, 'Job created and added to queue');

  return newJob;
}

export async function getJobById(jobId: string, userId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) throw new NotFoundError("Job");

  // Security: users can only see their own jobs
  if (job.userId !== userId) throw new NotFoundError("Job");

  return job;
}