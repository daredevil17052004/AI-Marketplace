import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export interface AgentJobPayload{
    jobId: string;
    agentId: string;
    userId: string;
    inputPayload: Record<string,unknown>;
}

export const agentQueue = new Queue<AgentJobPayload>("agent-queue", { 
    connection: redisConnection,
    defaultJobOptions:{
        attempts: 3,
        backoff:{
            type: "exponential",
            delay: 1000,
        }
    }
});

export async function enqueueAgentJob(payload: AgentJobPayload): Promise<void>{
    await agentQueue.add(
        "run-agent",
        payload ,
        { jobId: payload.jobId } 
    )
}