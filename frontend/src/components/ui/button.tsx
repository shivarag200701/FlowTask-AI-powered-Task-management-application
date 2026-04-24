import { cn } from "@/utils/functions/cn";
import { Spinner } from "@/components/ui/spinner";
import type { ReactNode, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex shrink-0 w-full items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 ",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 ",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border  text-secondary-foreground bg-background shadow-xs hover:bg-accent/60  hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 ",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-neutral-300",
        link: "text-primary underline-offset-4 hover:underline",
        custom:
          "border border-transparent hover:bg-accent hover:border-border rounded-lg data-[state=open]:bg-accent data-[state=open]:border-neutral-500 transition-all duration-200 data-[state=open]:ring-neutral-200 data-[state=open]:ring-4 p-2! ",
      },
      size: {
        default:
          "h-9 px-4 py-2 has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
  children,
  ref,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  const { disabled } = props;
  return (
    <button
      {...props}
      disabled={isSubmitting || disabled}
      type="submit"
      className={cn(
        "hover:cursor-pointer",
        buttonVariants({ variant, size }),
        className,
      )}
      onClick={onClick}
      ref={ref}
    >
      {isSubmitting ? (
        <div className="flex gap-2 justify-center">
          <Spinner className="text-gray-300" />
          <p>{Loading}</p>
        </div>
      ) : (
        <div className="flex gap-2 justify-center items-center">
          {icon && <div>{icon}</div>}
          {Initial && <p>{Initial}</p>}
        </div>
      )}
      {children}
    </button>
  );
};

export { Button, buttonVariants };
