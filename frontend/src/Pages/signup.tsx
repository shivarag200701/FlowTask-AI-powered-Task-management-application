import { SignupProvider, useSignupContext } from "@/Context/SingupContext";
import SignUpForm from "../Components/auth/signup/SignUpForm";
import LogoCard from "@/Components/LogoCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import VerfiyForm from "@/Components/auth/signup/VerfiyForm";
import { Grid } from "@/Components/ui/grid";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Gradient } from "./onboarding/pages/Welcome";

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
        className="flex flex-col items-center text-center gap-1 sm:rounded-[28px] sm:border sm:border-border sm:bg-card/80 backdrop-blur-2xl p-8 sm:p-10 sm:shadow-lg"
      >
        <h3 className="text-center text-xl font-semibold">
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
  const navigate = useNavigate();
  const { step } = useSignupContext();
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center ">
        <div
          className={cn(
            "absolute inset-y-0 left-1/2 w-full -translate-x-1/2",
            "mask-intersect mask-[linear-gradient(black,transparent_1000px),linear-gradient(90deg,transparent,black_5%,black_100%,transparent)]",
          )}
        >
          <Grid
            cellSize={60}
            patternOffset={[0.75, 0]}
            className="text-neutral-200"
          />
        </div>
        <button
          onClick={() => {
            navigate("/");
          }}
          className="text-slate-600  hidden lg:block hover:text-slate-900  absolute z-10 top-10 left-10 gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <p className="font-medium">Back to home</p>
          </div>
        </button>
        <div className="grow max-h-75 pt-10 relative">
          <Gradient className="opacity-5 mix-blend-overlay" />
          <LogoCard className="z-10" />
          <Gradient className="opacity-10 mix-blend-hard-light" />
        </div>
        {step === "signup" && <SignUpForm />}
        {step === "verify" && <Verify />}
      </div>
    </>
  );
};

export default Signup;
