import "dotenv/config";
import { Worker, Job } from "bullmq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redisConnection } from "../lib/redis.js";
import { AgentJobPayload } from "../lib/queue.js";
import { db } from "../db/index.js";
import { jobs, creditsLedger } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getAgentById } from "../services/agentService.js";
import { publishJobEvent } from "../lib/pubsub.js";
import logger from "../lib/logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function processJob(job: Job<AgentJobPayload>) {
  const { jobId, agentId, userId, inputPayload } = job.data;
  const startTime = Date.now();
  const jobLogger = logger.child({ jobId, agentId, userId });

  jobLogger.info('Starting job execution');

  try {
    // Step 1: mark as processing
    await db.update(jobs)
      .set({ status: "processing" })
      .where(eq(jobs.id, jobId));

    // Step 2: get agent
    const agent = await getAgentById(agentId);

    // Step 3: call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: agent.systemPrompt,
    });

    const result = await model.generateContent(
      JSON.stringify(inputPayload)
    );

    const output = result.response.text();

    // Step 4: mark as completed
    await db.update(jobs)
      .set({
        status: "completed",
        outputResult: { text: output },
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      })
      .where(eq(jobs.id, jobId));

    await publishJobEvent(userId, {
      jobId,
      status: "completed",
      outputResult: { text: output },
    });

    jobLogger.info({ durationMs: Date.now() - startTime }, 'Job completed successfully');

  } catch (err) {
    // Only mark failed and issue refund on the LAST retry attempt
    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1) - 1;

    // Always update status so the UI can reflect the failure immediately
    await db.update(jobs)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // Issue credit refund on final failure so the user is not charged for a broken run
    if (isLastAttempt) {
      try {
        const agent = await getAgentById(agentId).catch(() => null);
        if (agent && agent.creditCost > 0) {
          await db.insert(creditsLedger).values({
            userId,
            amount: agent.creditCost,   // positive = refund
            reason: "job_refund",
            jobId,
          });
          jobLogger.info({ creditRefund: agent.creditCost }, 'Credits refunded after final job failure');
        }
      } catch (refundErr) {
        // Refund failure must not block the original error propagation
        jobLogger.error({ err: refundErr }, 'Failed to issue credit refund');
      }
    }

    await publishJobEvent(userId, {
      jobId,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    });

    jobLogger.error({ err, durationMs: Date.now() - startTime }, 'Job failed during processing');
    throw err; // rethrow so BullMQ knows the job failed and can retry
  }
}

const worker = new Worker<AgentJobPayload>(
  "agent-queue",
  processJob,
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

worker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, 'Job failed');
});

logger.info("Worker started, waiting for jobs...");