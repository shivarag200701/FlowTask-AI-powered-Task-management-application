import { type OnboardingStep } from "@shiva200701/todotypes";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const UseOnboardingProgess = () => {
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: (step: OnboardingStep) => saveStep(step),
  });

  const saveStep = async (step: OnboardingStep) => {
    await axios.post("/v1/user/onboarding/progess", {
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
