import { cn } from "@/utils/cn";
import { Spinner } from "./ui/spinner";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

export const ButtonVariants = cva(
  "transition-all text-white hover:shadow-lg shadow-sm hover:opacity-90",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white border-transparent",
        secondary:
          "bg-button-secondary text-foreground border border-gray-400  data-[state=open]:ring-4 data-[state=open]:ring-gray-200 ",
      },
      size: {
        small: "text-sm py-2 px-3",
        medium: "text-base py-2 px-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ButtonVariants> {
  isSubmitting?: boolean;
  Initial?: ReactNode;
  Loading?: string;
  icon?: ReactNode;
}

const Button = ({
  isSubmitting,
  Initial,
  Loading,
  onClick,
  icon,
  variant,
  size,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "w-full py-3 text-white font-medium rounded-lg",
        "bg-accent hover:shadow-lg shadow-sm",
        "hover:opacity-90 transition-opacity cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
        ButtonVariants({ variant, size }),
      )}
      onClick={onClick}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex gap-2 justify-center">
          <Spinner className="text-gray-300" />
          <span>{Loading}</span>
        </div>
      ) : (
        <div className="flex gap-2 justify-center items-center">
          {icon}
          {Initial}
        </div>
      )}
    </button>
  );
};

export default Button;
