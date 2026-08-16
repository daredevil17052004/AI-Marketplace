import "dotenv/config";
import { Worker, Job } from "bullmq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redisConnection } from "../lib/redis.js";
import { AgentJobPayload } from "../lib/queue.js";
import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getAgentById } from "../services/agentService.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function processJob(job: Job<AgentJobPayload>) {
  const { jobId, agentId, inputPayload } = job.data;
  const startTime = Date.now();

  try {
    // Step 1: mark as processing
    await db.update(jobs)
      .set({ status: "processing" })
      .where(eq(jobs.id, jobId));

    // Step 2: get agent
    const agent = await getAgentById(agentId);

    // Step 3: call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
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
  } catch (err) {
    // mark as failed immediately in DB before BullMQ retries
    await db.update(jobs)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    throw err; // rethrow so BullMQ knows the job failed and can retry
  }
}

const worker = new Worker<AgentJobPayload>(
  "agent-queue",
  processJob,
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);

  if (job?.data.jobId) {
    await db.update(jobs)
      .set({
        status: "failed",
        errorMessage: err.message,
        completedAt: new Date(),
      })
      .where(eq(jobs.id, job.data.jobId));
  }
});

console.log("Worker started, waiting for jobs...");