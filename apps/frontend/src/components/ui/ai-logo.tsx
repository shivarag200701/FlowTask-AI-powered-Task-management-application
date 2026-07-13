import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AILogoProps {
  active?: boolean;
  animated?: boolean;
  className?: string;
}

const gradient =
  "bg-[conic-gradient(from_230deg,#EAB308,#F00,#00FFF9,#855AFC,#3A8BFD,#A3ECB3,#EAB308)]";

export function AILogo({
  active = false,
  animated = false,
  className,
}: AILogoProps) {
  if (animated) {
    return (
      <div className={cn("relative size-14", className)}>
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-md opacity-60 animate-spin animation-duration-[6s]",
            gradient
          )}
        />
        <div className="absolute inset-1 rounded-full bg-background/80 backdrop-blur-sm" />
        <div
          className={cn(
            "absolute inset-[5px] rounded-full opacity-90 animate-spin animation-duration-[4s] direction-reverse",
            gradient
          )}
        />
        <div className="absolute inset-2.5 rounded-full bg-background/60 backdrop-blur-sm" />
      </div>
    );
  }

  return (
    <motion.div
      className={cn("relative size-4", className)}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      key={active ? "active" : "inactive"}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="gradient"
            className={cn("size-full rounded-full", gradient)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        ) : (
          <motion.div
            key="inactive"
            className="size-full rounded-full bg-muted-foreground/50"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-[4px] rounded-full bg-background" />
    </motion.div>
  );
}
