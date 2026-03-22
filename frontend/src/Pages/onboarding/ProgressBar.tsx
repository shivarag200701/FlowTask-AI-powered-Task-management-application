import { useLocation } from "react-router-dom";

const ONBOARDING_STEPS = ["welcome", "plan", "preferences"];

const ProgressBar = () => {
  const { pathname } = useLocation();

  const onboardingStep = pathname.split("/").at(-1) ?? "";

  const currentIndex = ONBOARDING_STEPS.indexOf(onboardingStep);
  console.log(currentIndex + 1);

  const progress =
    currentIndex >= 0
      ? ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100
      : 0;

  return (
    <progress
      id="progress-bar"
      className="fixed top-0 left-0 progressBar w-full"
      max="100"
      value={progress}
      aria-label="Onboarding progress"
    ></progress>
  );
};

export default ProgressBar;
