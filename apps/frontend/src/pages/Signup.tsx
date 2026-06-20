import { SignupProvider, useSignupContext } from "@/context/SingupContext";
import SignUpForm from "@/features/auth/signup/SignUpForm";
import VerfiyForm from "@/features/auth/signup/VerfiyForm";
import { motion } from "motion/react";
import AuthLayout from "@/layouts/AuthLayout";

const Signup = () => {
  return (
    <>
      <SignupProvider>
        <SignupFlow />
      </SignupProvider>
    </>
  );
};

const Verify = () => {
  const { email } = useSignupContext();
  return (
    <div className="w-full max-w-xl grow relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center gap-1 sm:rounded-[28px] sm:border sm:border-border sm:bg-white backdrop-blur-2xl p-4 sm:p-10 sm:shadow-lg"
      >
        <h3 className="text-center text-xl font-semibold text-neutral-800">
          Verify your email address
        </h3>
        <p className="text-base font-medium text-neutral-500">
          Enter the six digit verification code sent to{" "}
          <strong className="font-semibold text-neutral-600" title={email}>
            {email}
          </strong>
        </p>
        <div className="mt-12">
          <VerfiyForm />
        </div>
      </motion.div>
    </div>
  );
};

const SignupFlow = () => {
  const { step } = useSignupContext();
  return (
    <AuthLayout showBackButton>
      {step === "signup" && <SignUpForm />}
      {step === "verify" && <Verify />}
    </AuthLayout>
  );
};

export default Signup;
