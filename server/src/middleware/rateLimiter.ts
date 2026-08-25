import { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../lib/rateLimiter.js";
import logger from "../lib/logger.js";

/*** 
 * @param action
 * @param limit
 * @param windowSeconds
*/

export function rateLimiter(action: string,  limit: number = 60, windowSeconds: number = 60 ){
    return async (req: Request, res:Response, next:NextFunction)=>{
        try{
            const userId = req.user?.userId;
            if(!userId){
                // no user  = no rate limiting
                logger.warn('Rate Limiter called on unauthenticated route');
                return next();
            }

            const result = await checkRateLimit(userId, action, limit,windowSeconds);

            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', result.remaining);

            if(!result.allowed){
                const retryAfterSeconds = Math.ceil((result.resetTimeMs - Date.now()) / 1000);
                logger.warn({
                    userId,action,limit
                }, `Rate Limit exceeded for action ${action}`);

                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `You have exceeded the ${limit} request limit for this action. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                })
            }
            next();
        }catch(err){
            logger.error({ err, action}, 'Rate Limiter failed');
            next(); // dont failafe on rate limit middleware
        }
    }
}