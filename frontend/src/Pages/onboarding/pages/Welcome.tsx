import Onboarding from "../Onboarding";
import { cn } from "@/lib/utils";
import Wordmark from "@/Components/ui/wordmark";
import { motion } from "motion/react";
import NextButton from "../NextButton";

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      type: "spring" as const,
      stiffness: 25,
    },
  },
};

export const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const Welcome = () => {
  return (
    <Onboarding>
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col items-center px-4 py-16 max-w-sm">
          <div className="relative w-auto flex items-center justify-center">
            <Gradient className="opacity-25" />
            <Wordmark className="relative z-20" variants={item} />
            <Gradient className="opacity-10  mix-blend-hard-light" />
          </div>
          <motion.h1
            className="text-xl text-center font-semibold z-20 relative mt-20 text-black"
            variants={item}
          >
            Welcome to FlowTask
          </motion.h1>
          <motion.p
            className="text-center text-base text-neutral-500 relative z-20 mt-5"
            variants={item}
          >
            Your tasks, organized. Your deadlines, met. Your flow,
            uninterrupted.
          </motion.p>
          <motion.div className="w-full" variants={item}>
            <NextButton step="user-profile" text="Get Started" />
          </motion.div>
        </div>
      </motion.div>
    </Onboarding>
  );
};

export function Gradient({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 aspect-square -translate-x-1/2 -translate-y-20",
        className,
      )}
    >
      <div className="size-[250px] -scale-x-[1.8] blur-2xl">
        <div
          className={cn(
            "size-full -rotate-90 saturate-[3]",
            "bg-[conic-gradient(from_279deg,#EAB308_47deg,#F00_121deg,#00FFF9_190deg,#855AFC_251deg,#3A8BFD_267deg,#A3ECB3_314deg,#EAB308_360deg)]",
          )}
        />
      </div>
    </div>
  );
}

export default Welcome;
