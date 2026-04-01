import { api } from "@/utils/api";
import type { OnboardingStep } from "@shiva200701/todotypes";
export async function getOnboardingProgress(): Promise<OnboardingStep> {
  const res = await api.get("/v1/user/onboarding/progess");
  return res.data.step;
}
