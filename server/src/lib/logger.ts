import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
    level : process.env.LOG_LEVEL || 'info',
    transport : isDev
        ? {
            target : 'pino-pretty',
            options :{
                colorise: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            }
        }
        : undefined,
    base:{
        service : 'ai-marketplace-api',
        env: process.env.NODE_ENV || 'development',
    },
})

export default logger;