import { Button } from "@/components/ui/button";
import AnimatedSizeContainer from "@/components/ui/animated-size-container";
import { Auth } from "@/context/AuthContext";
import { useSignupContext } from "@/context/SingupContext";
import UseOnboardingProgess from "@/features/auth/onboarding/Use-onboarding-progess";
import api from "@/utils/api";
import { cn } from "@/utils/cn";
import { isAxiosError } from "axios";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { toast } from "sonner";

const VerfiyForm = () => {
  const [code, setCode] = useState("");
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [pending, setPending] = useState(false);
  const { email, password, setPassword } = useSignupContext();
  const { setIsAuthenticated, setEmail } = Auth();
  const { continueTo } = UseOnboardingProgess();

  const handleSubmit = async () => {
    if (!code) return;

    setPending(true);

    try {
      await api.post("/api/v1/user/signup/verify", {
        email,
        password,
        code,
      });
      setPending(false);
      setIsAuthenticated(true);
      setEmail(email);
      continueTo("welcome");
      setPassword("");
    } catch (error) {
      setPending(false);
      if (isAxiosError(error)) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
      setCode("");
      setIsInvalidCode(true);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <OTPInput
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={(code) => {
            setCode(code);
            setIsInvalidCode(false);
          }}
          render={({ slots }) => (
            <div className="flex gap-4 items-center justify-between">
              {slots.map(({ char, isActive, hasFakeCaret }, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "relative flex h-14 w-12 items-center justify-center text-xl",
                    "rounded-lg border border-neutral-200 bg-white ring-0 transition-all text-black",
                    isActive &&
                      "z-10 border border-neutral-800 ring-2 ring-neutral-200",
                    isInvalidCode && "border-red-500 ring-red-200",
                  )}
                >
                  {char}
                  {hasFakeCaret && (
                    <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-px bg-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          onComplete={() => {
            handleSubmit();
          }}
        />
        <AnimatedSizeContainer height>
          {isInvalidCode && (
            <p className="pt-3 text-center text-xs font-medium text-red-500">
              Invalid code. Please try again.
            </p>
          )}
        </AnimatedSizeContainer>
        <Button
          className="mt-8 rounded-md"
          Initial="Continue"
          Loading="Verifying..."
          disabled={!code || code.length < 6}
          isSubmitting={pending}
        />
      </form>
    </div>
  );
};

export default VerfiyForm;
