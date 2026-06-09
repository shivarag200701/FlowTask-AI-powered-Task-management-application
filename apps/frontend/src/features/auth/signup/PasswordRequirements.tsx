import { CircleCheck } from "lucide-react";
import { cn } from "@/utils/functions/cn";
import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const REQUIREMENTS: {
  name: string;
  check: (password: string) => boolean;
}[] = [
  {
    name: "Number",
    check: (p) => /\d/.test(p),
  },
  {
    name: "Uppercase letter",
    check: (p) => /[A-Z]/.test(p),
  },
  {
    name: "Lowercase letter",
    check: (p) => /[a-z]/.test(p),
  },
  {
    name: "8 chars",
    check: (p) => p.length >= 8,
  },
];

export const PasswordRequirements = memo(function PasswordRequirements({
  field = "password",
  className,
}: {
  field?: string;
  className?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext();

  const password = useWatch({ name: field });

  return (
    <ul
      className={cn(
        "mt-2 flex flex-wrap items-center justify-center gap-3",
        className
      )}
    >
      {REQUIREMENTS.map(({ name, check }) => {
        const checked = password?.length && check(password);

        return (
          <li
            key={name}
            className={cn(
              "flex items-center gap-1 text-xs text-neutral-400 transition-colors",
              checked ? "text-green-600" : errors[field] && "text-red-600"
            )}
          >
            <div className="flex justify-center items-center">
              <CircleCheck
                className={cn(
                  "size-4 transition-opacity",
                  checked
                    ? "animate-scale-in [--from-scale:1] [--to-scale:1.2] direction-alternate animation-duration-[150] repeat-2 [animation-timing-function:ease-in-out]"
                    : errors[field]
                      ? "text-red-600"
                      : "text-neutral-200"
                )}
              />
            </div>
            <span>{name}</span>
          </li>
        );
      })}
    </ul>
  );
});
