import { RateLimiterRedis } from "rate-limiter-flexible";
import type { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient;

//initilize the rate limiter
export function initRateLimiter(redisClient: RedisClient) {
  client = redisClient;
}
const MAX_OTP_ATTEMPTS = 5; // Block after 5 failed attempts
const OTP_LOCKOUT_DURATION = 60 * 60 * 24; // Block for 24 hours

const OTP_opts = {
  points: MAX_OTP_ATTEMPTS,
  duration: OTP_LOCKOUT_DURATION,
  keyPrefix: "signup:attempts",
  useRedisPackage: true,
};

let _otpLimiter: RateLimiterRedis | null = null;

export function getOTPRateLimiter(): RateLimiterRedis {
  if (!_otpLimiter) {
    _otpLimiter = new RateLimiterRedis({ storeClient: client, ...OTP_opts });
  }
  return _otpLimiter;
}
