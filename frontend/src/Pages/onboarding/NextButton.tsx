import Button from "@/Components/Button";
import type { OnboardingStep } from "@shiva200701/todotypes";
import UseOnboardingProgess from "./UseOnboardingProgess";

const NextButton = ({
  step,
  text,
  loadingText,
  isSubmitting,
}: {
  step: OnboardingStep;
  text: string;
  loadingText?: string;
  isSubmitting?: boolean;
}) => {
  const { continueTo } = UseOnboardingProgess();
  console.log("is submitting", isSubmitting);

  return (
    <Button
      Initial={text}
      Loading={loadingText}
      className="rounded-md mt-5"
      onClick={() => {
        if (!isSubmitting) continueTo(step);
      }}
      isSubmitting={isSubmitting}
    />
  );
};

export default NextButton;
