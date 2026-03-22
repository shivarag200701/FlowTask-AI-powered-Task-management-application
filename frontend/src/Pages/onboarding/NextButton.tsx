import Button from "@/Components/Button";
import type { OnboardingStep } from "@shiva200701/todotypes";
import UseOnboardingProgess from "./UseOnboardingProgess";

const NextButton = ({ step, text }: { step: OnboardingStep; text: string }) => {
  const { continueTo } = UseOnboardingProgess();
  return (
    <Button
      Initial={text}
      className="rounded-md mt-5"
      onClick={() => continueTo(step)}
    />
  );
};

export default NextButton;
