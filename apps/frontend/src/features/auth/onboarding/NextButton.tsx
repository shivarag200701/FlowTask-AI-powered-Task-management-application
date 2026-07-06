import { Button } from "@/components/ui/button";
import type { OnboardingStep } from "@shiva200701/todotypes";
import UseOnboardingProgess from "@/features/auth/onboarding/Use-onboarding-progess";

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

  return (
    <Button
      Initial={text}
      Loading={loadingText}
      className="mt-5 w-full"
      onClick={() => {
        if (!isSubmitting) continueTo(step);
      }}
      isSubmitting={isSubmitting}
      size="lg"
    />
  );
};

export default NextButton;
