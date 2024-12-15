import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.REDIS_PASSWORD || '',
})

redis.ping().then((res) => {
  console.log(
    `Redis ping: ${res}`
  )
})

// Create a sliding window rate limiter
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1h'), // Default limit
  analytics: true,
  prefix: 'api-rate-limit',
})

export async function checkRateLimit(identifier: string, limit: number) {
  const customLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '1h'),
    analytics: true,
    prefix: `api-rate-limit:${identifier}`,
  })

  const result = await customLimiter.limit(identifier)
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
} 