import "dotenv/config";
import { Worker, Job } from "bullmq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redisConnection } from "../lib/redis.js";
import { AgentJobPayload } from "../lib/queue.js";
import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";
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
      systemInstruction: agent.systemPrompt,  // agent's instruction
    });

    const result = await model.generateContent(
      JSON.stringify(inputPayload)  // user's input
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

    // publisher added
    await publishJobEvent(userId,{
      jobId,
      status:"completed",
      outputResult:{text: output},
    });

    jobLogger.info({ durationMs: Date.now() - startTime }, 'Job completed successfully');

  } catch (err) {
    // mark as failed immediately in DB before BullMQ retries
    await db.update(jobs)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

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

worker.on("failed", async (job, err) => {
  logger.error({ err, jobId: job?.id }, 'Job failed');

  if (!job) return;

  if (job.data.jobId) {
    await db.update(jobs)
      .set({
        status: "failed",
        errorMessage: err.message,
        completedAt: new Date(),
      })
      .where(eq(jobs.id, job.data.jobId));
  }

  await publishJobEvent(job.data.userId,{
    jobId:job.data.jobId,
    status:"failed",
    errorMessage: err.message,
  })
});

logger.info("Worker started, waiting for jobs...");