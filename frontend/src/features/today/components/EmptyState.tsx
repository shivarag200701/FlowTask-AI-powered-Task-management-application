import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[500px] border border-border rounded-xl">
      {/* Unique floating illustration */}
      <div className="relative mb-8">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="mainGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient
              id="accentGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#E9D5FF" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Floating abstract shapes */}
          {/* Main circle with glow */}
          <circle
            cx="90"
            cy="90"
            r="45"
            fill="url(#mainGradient)"
            opacity="0.15"
            filter="url(#glow)"
          />

          {/* Floating document/card */}
          <g transform="translate(55, 60)">
            <rect
              width="70"
              height="85"
              rx="12"
              fill="white"
              stroke="url(#mainGradient)"
              strokeWidth="2.5"
              opacity="0.9"
            />
            {/* Checkmark circle */}
            <circle
              cx="35"
              cy="30"
              r="12"
              fill="url(#mainGradient)"
              opacity="0.2"
            />
            <path
              d="M30 30 L33 33 L40 26"
              stroke="url(#mainGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
            {/* Lines */}
            <line
              x1="15"
              y1="55"
              x2="55"
              y2="55"
              stroke="url(#accentGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />
            <line
              x1="15"
              y1="65"
              x2="50"
              y2="65"
              stroke="url(#accentGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />
            <line
              x1="15"
              y1="75"
              x2="45"
              y2="75"
              stroke="url(#accentGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />
          </g>

          {/* Decorative sparkles */}
          <g opacity="0.6">
            {/* Top right sparkle */}
            <path
              d="M140 40 L142 45 L147 47 L142 49 L140 54 L138 49 L133 47 L138 45 Z"
              fill="url(#mainGradient)"
            />
            {/* Bottom left sparkle */}
            <path
              d="M35 130 L37 135 L42 137 L37 139 L35 144 L33 139 L28 137 L33 135 Z"
              fill="url(#accentGradient)"
            />
            {/* Top left small */}
            <circle
              cx="30"
              cy="50"
              r="3"
              fill="url(#mainGradient)"
              opacity="0.7"
            />
            {/* Right small */}
            <circle
              cx="145"
              cy="95"
              r="2.5"
              fill="url(#accentGradient)"
              opacity="0.7"
            />
            {/* Bottom right */}
            <path
              d="M145 135 L146 138 L149 139 L146 140 L145 143 L144 140 L141 139 L144 138 Z"
              fill="url(#mainGradient)"
              opacity="0.8"
            />
          </g>

          {/* Abstract floating dots */}
          <circle
            cx="50"
            cy="85"
            r="4"
            fill="url(#accentGradient)"
            opacity="0.4"
          />
          <circle
            cx="130"
            cy="75"
            r="5"
            fill="url(#mainGradient)"
            opacity="0.3"
          />
          <circle
            cx="120"
            cy="125"
            r="3"
            fill="url(#accentGradient)"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="text-center space-y-2">
        <h3 className="text-foreground text-2xl">No tasks for today</h3>
        <Button>Create Task</Button>
      </div>
    </div>
  );
}
