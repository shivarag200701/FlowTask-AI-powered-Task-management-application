import useResizeObeserver from "@/hooks/useResizeObserver";
import { useRef, type ComponentProps, type PropsWithChildren } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const defaultTransition = { type: "spring" as const, duration: 0.5 };

type AnimatedSizeContainerProps = PropsWithChildren<{
  width?: boolean;
  height?: boolean;
}> &
  Omit<ComponentProps<typeof motion.div>, "animate" | "children">;

function AnimatedSizeContainer({
  children,
  height = false,
  width = false,
  className,
  transition,
  ...rest
}: AnimatedSizeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverEntry = useResizeObeserver(containerRef);

  const hasMeasuredRef = useRef(false);

  const measuredWidth = resizeObserverEntry?.contentRect?.width;
  const measuredHeight = resizeObserverEntry?.contentRect?.height;

  const isFirstMeasurement =
    (width ? measuredWidth != null : true) &&
    (height ? measuredHeight != null : true) &&
    !hasMeasuredRef.current;

  if (resizeObserverEntry) {
    hasMeasuredRef.current = true;
  }

  const effectiveTransition =
    transition ?? (isFirstMeasurement ? { duration: 0 } : defaultTransition);

  return (
    <motion.div
      className={cn("", className)}
      animate={{
        width: width ? (measuredWidth ?? "auto") : "auto",
        height: height ? (measuredHeight ?? "auto") : "auto",
      }}
      transition={effectiveTransition}
      {...rest}
    >
      <div
        ref={containerRef}
        className={cn(height && "h-max", width && "w-max")}
      >
        {children}
      </div>
    </motion.div>
  );
}

export default AnimatedSizeContainer;
