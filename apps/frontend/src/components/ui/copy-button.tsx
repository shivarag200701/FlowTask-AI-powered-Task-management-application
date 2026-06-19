"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { type LucideIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/functions/cn";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const copyButtonVariants = cva(
  "relative group rounded-full p-1.5 transition-all duration-75",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-neutral-100 active:bg-neutral-200",
        neutral: "bg-transparent hover:bg-neutral-100 active:bg-neutral-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function CopyButton({
  value,
  className,
  icon,
  successMessage,
}: {
  value: string;
  className?: string;
  icon?: LucideIcon;
  successMessage?: string;
} & VariantProps<typeof copyButtonVariants>) {
  const [copied, copyToClipboard] = useCopyToClipboard();
  const Comp = icon || Copy;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toast.promise(copyToClipboard(value), {
          success: successMessage || "Copied to clipboard!",
        });
      }}
      type="button"
      className={cn(
        "flex w-full items-center h-10 rounded-lg border border-neutral-200 bg-background px-4 shadow-xs transition-all hover:cursor-pointer overflow-hidden",
        className
      )}
    >
      <span className="text-neutral-500 font-mono text-xs truncate min-w-0">
        {value}
      </span>
      <span className="sr-only">Copy</span>
      <div className="ml-auto pl-2 shrink-0 rounded-md p-1.5 hover:bg-accent transition-colors">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-black" />
        ) : (
          <Comp className="h-3.5 w-3.5 text-black" />
        )}
      </div>
    </button>
  );
}
