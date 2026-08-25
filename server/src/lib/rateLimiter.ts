import { redisConnection } from './redis.js';
import logger from './logger.js';

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTimeMs: number;
}

//sliding window rate limiter using redis sorted sets

/**
 * @param userId
 * @param action
 * @param limit
 * @param windowSeconds
 */

export async function checkRateLimit(
    userId: string,
    action: string,
    limit: number = 60,
    windowSeconds: number = 60
): Promise<RateLimitResult> {
    const key = `rate_limit:${action}:${userId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    try{
        //using redis pipeline to execute all commands atomically
        const multi = redisConnection.multi();
        
        // 1. add current request timestamp 
        multi.zadd(key, now, now.toString());

        //2. remove any timestamps older than our window
        multi.zremrangebyscore(key, 0, windowStart);

        // 3. count how many requests are in current window
        multi.zcard(key);

        //4. set an expiry on the key so it cleans itself up if the user goes inactive
        multi.expire(key, windowSeconds);

        const results = await multi.exec();
        if(!results){
            throw new Error('Redis transaction failed');
        }


        const count = results[2][1] as number;
        const allowed = count <= limit;
        const remaining = Math.max(0,limit-count);

        return{
            allowed,
            remaining,
            resetTimeMs: now + (windowSeconds * 1000)
        };
    }catch (error){
        logger.error({err: error, userId, action}, 'Rate limiter Redis error');
        return {
            allowed: true, 
            remaining: 1,
            resetTimeMs: now
        };
    }
}