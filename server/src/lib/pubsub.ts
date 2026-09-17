import { Redis } from "ioredis";

export const publisher = new Redis(process.env.REDIS_URL!);
export const subscriber = new Redis(process.env.REDIS_URL!);

// rest of the file stays the same

//Publisher - used by the worker to broadcast job events
// export const publisher = new Redis({
//     host: "localhost",
//     port:6379
// });

//Subscriber - used by the WS server to listen for job events;
// export const subscriber = new Redis({
//     host:"localhost",
//     port: 6379,
// });

//channel naming - scoped per user so users never see each other's events
export function getUserChannel(userId: string): string{
    return`job:events:${userId}`;
}

export async function publishJobEvent(
    userId: string,
    event: {
        jobId: string;
        status: string;
        outputResult? : unknown;
        errorMessage? : string | null;
    }
): Promise<void>{
    const channel = getUserChannel(userId);
    await publisher.publish(channel, JSON.stringify(event))
}


