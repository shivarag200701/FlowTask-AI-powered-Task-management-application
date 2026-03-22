import type { OnboardingStep } from "@shiva200701/todotypes";
import { redisClient } from "../index.js";

const CACHE_KEY_PREFIX = "onboarding-step";
export const ONBOARDING_WINDOW_SECONDS = 60 * 60 * 24; // 24 hours

export async function setOnboardingProgress(
  userId: string,
  step: OnboardingStep,
) {
  return await redisClient.set(`${CACHE_KEY_PREFIX}:${userId}`, step, {
    expiration: {
      type: "EX",
      value: ONBOARDING_WINDOW_SECONDS,
    },
  });
}

export async function getOnboardingProgress(userId: string) {
  return await redisClient.get(`${CACHE_KEY_PREFIX}:${userId}`);
}
