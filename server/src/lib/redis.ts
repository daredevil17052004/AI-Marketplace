// import { Redis } from "ioredis";

// export const redisConnection = process.env.REDIS_URL
//   ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
//   : new Redis({
//       host: "localhost",
//       port: 6379,
//       maxRetriesPerRequest: null,
//   });

import {Redis} from "ioredis";

export const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});