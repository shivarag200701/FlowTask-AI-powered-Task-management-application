import { cn } from "@/lib/utils";

type SpinnerProps = React.SVGProps<SVGSVGElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  const size = 16; // px
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 0–1: how much of the circle is the "thumb"
  const thumbFraction = 0.2;

  return (
    <svg
      role="status"
      aria-label="Loading"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("animate-spin-slow", className)}
      {...props}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className={cn("text-accent/20", className)} // light track
      />

      {/* Thumb (arc) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - thumbFraction)}
        className="text-black"
      >
        {/* Start arc at top instead of right */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`-90 ${size / 2} ${size / 2}`}
          to={`270 ${size / 2} ${size / 2}`}
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
