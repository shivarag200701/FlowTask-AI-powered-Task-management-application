import { useCallback, useState, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  children?: ReactNode;
  Type: string;
  register?: UseFormRegisterReturn;
  error?: boolean;
}

const InputBox = ({
  placeholder,
  children,
  Type,
  register,
  error,
  className,
  ...props
}: InputBoxProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const toggleIsPasswordVisible = useCallback(
    () => setIsPasswordVisible(!isPasswordVisible),
    [isPasswordVisible, setIsPasswordVisible]
  );

  return (
    <div className="flex flex-col my-1 justify-start w-full relative">
      {children}
      <input
        {...props}
        {...register}
        placeholder={placeholder}
        type={isPasswordVisible ? "text" : Type}
        autoComplete={Type === "password" ? "new-password" : "off"}
        className={cn(
          "py-2 px-3  bg-slate-100 backdrop-blur-sm text-slate-900 placeholder:text-[#9EA0BB] border  rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all relative sm:text-sm",
          className
        )}
      />
      {Type === "password" && (
        <button
          className={cn(
            "text-black absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer"
          )}
          type="button"
          onClick={() => toggleIsPasswordVisible()}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        >
          {isPasswordVisible ? (
            <Eye
              className="size-4 flex-none text-neutral-500 transition hover:text-neutral-700"
              aria-hidden
            />
          ) : (
            <EyeOff
              className="size-4 flex-none text-neutral-500 transition hover:text-neutral-700"
              aria-hidden
            />
          )}
        </button>
      )}
    </div>
  );
};

export default InputBox;
