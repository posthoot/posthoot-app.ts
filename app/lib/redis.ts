import { Redis } from 'ioredis';
import {logger, LogLevel} from '@/app/lib/logger';

const FILE_NAME = 'lib/redis.ts';

class RedisClient {
  private static instance: Redis;
  
  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      logger.info({
        fileName: FILE_NAME,
        lineNumber: 20,
        level: LogLevel.INFO,
        functionName: 'getInstance',
        message: 'Creating new Redis connection'
      });
      
      RedisClient.instance = new Redis(process.env.REDIS_URL);

      RedisClient.instance.on('connect', () => {
        logger.info({
          fileName: FILE_NAME, 
          lineNumber: 32,
          level: LogLevel.INFO,
          functionName: 'onConnect',
          message: '✅ Redis connected successfully'
        });
      });

      RedisClient.instance.on('error', (error) => {
        logger.error({
          fileName: FILE_NAME,
          lineNumber: 36,
          level: LogLevel.ERROR,
          functionName: 'onError',
          message: `❌ Redis connection error, error:${error.message}`
        });
      });
    }

    return RedisClient.instance;
  }
}

// Export a singleton instance
export const redis = RedisClient.getInstance();

// For testing purposes
export const disconnectRedis = async () => {
  if (RedisClient.getInstance()) {
    logger.info({
      fileName: FILE_NAME,
      lineNumber: 55,
      level: LogLevel.INFO,
      functionName: 'disconnectRedis',
      message: '🔌 Disconnecting Redis'
    });
    await RedisClient.getInstance().quit();
  }
};
