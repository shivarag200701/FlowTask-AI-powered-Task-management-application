import { type OnboardingStep } from "@shiva200701/todotypes";
import { useNavigate } from "react-router-dom";
import api from "@/utils/functions/api";
import { useQueryClient } from "@tanstack/react-query";
import { onboardingQueryKeys } from "@/query-keys";

const UseOnboardingProgess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function continueTo(step: OnboardingStep) {
    await api.post("/api/v1/user/onboarding/progess", { step });
    queryClient.setQueryData(onboardingQueryKeys.progress, step);
    navigate(`/onboarding/${step}`);
  }

  return {
    continueTo,
  };
};

export default UseOnboardingProgess;
