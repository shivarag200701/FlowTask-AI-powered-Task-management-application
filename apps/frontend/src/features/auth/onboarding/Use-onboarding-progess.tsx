import { type OnboardingStep } from "@shiva200701/todotypes";
import { useNavigate } from "react-router-dom";
import api from "@/utils/functions/api";

const UseOnboardingProgess = () => {
  const navigate = useNavigate();

  function continueTo(step: OnboardingStep) {
    console.log("called here", step);

    navigate(`/onboarding/${step}`);
    api.post("/api/v1/user/onboarding/progess", { step });
  }

  return {
    continueTo,
  };
};

export default UseOnboardingProgess;
