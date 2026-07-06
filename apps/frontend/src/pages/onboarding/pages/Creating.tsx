import { Gradient } from "@/components/ui/gradient";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";
import AuthLayout from "@/layouts/AuthLayout";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const steps = [
  "Setting up your workspace",
  "Configuring your preferences",
  "Almost there",
];

function Creating() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthLayout logo="none" gridCellSize={10} showLogoHalo={false}>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Gradient className="opacity-20 size-[300px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="relative z-20 flex flex-col items-center gap-8"
        >
          <motion.img
            src="/logo.png"
            alt="Logo"
            width={64}
            height={64}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
            >
              <ShimmeringText
                text={steps[stepIndex]}
                duration={1.5}
                className="text-4xl font-bold"
                color="var(--color-neutral-800)"
                shimmeringColor="var(--color-neutral-400)"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

export default Creating;
