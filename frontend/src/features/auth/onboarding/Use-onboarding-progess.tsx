import { type OnboardingStep } from "@shiva200701/todotypes";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

const UseOnboardingProgess = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: (step: OnboardingStep) => saveStep(step),
    onSuccess: (_, step) => {
      queryClient.setQueryData(["onboardingProgress"], step);
    },
  });

  const saveStep = async (step: OnboardingStep) => {
    await api.post("/api/v1/user/onboarding/progess", {
      step,
    });
  };

  function continueTo(step: OnboardingStep) {
    mutate(step);
    navigate(`/onboarding/${step}`);
  }
  return {
    continueTo,
  };
};

export default UseOnboardingProgess;
