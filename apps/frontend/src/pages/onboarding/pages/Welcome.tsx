import Wordmark from "@/components/ui/wordmark";
import { Gradient } from "@/components/ui/gradient";
import { motion } from "motion/react";
import NextButton from "@/features/auth/onboarding/NextButton";
import AuthLayout from "@/layouts/AuthLayout";

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.6,
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
    <AuthLayout
      gridCellSize={10}
      showLogoHalo={false}
      showSignedInHint
      logoSlot={
        <div className="relative w-auto flex items-center justify-center">
          <Gradient className="opacity-25 size-[250px]" />
          <Wordmark className="relative z-20" variants={item} />
          <Gradient className="opacity-10  mix-blend-hard-light size-[250px]" />
        </div>
      }
    >
      <motion.div
        className="flex flex-col items-center justify-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col items-center px-4 py-16 max-w-sm">
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
    </AuthLayout>
  );
};

export default Welcome;
