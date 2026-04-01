import { isAxiosError } from "axios";
import { useCallback, useState } from "react";
import InputBox from "../../InputBox";
import { useForm, FormProvider } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { GoogleSignInButton } from "../../GoogleSignInButton";
import { PasswordRequirements } from "./PasswordRequirements";
import { toast } from "sonner";
import { useSignupContext } from "@/Context/SingupContext";
import { motion } from "motion/react";

type Inputs = {
  email: string;
  password: string;
};

const SignUpForm = () => {
  const form = useForm<Inputs>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = form;

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { setStep, setEmail, setPassword } = useSignupContext();

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    async (data) => {
      const { email, password } = getValues();

      if (email && !password && !showPassword) {
        setShowPassword(true);
        return;
      }
      try {
        await api.post("/v1/user/signup/send-otp", data);
        setEmail(getValues("email"));
        setPassword(getValues("password"));
        setStep("verify");
      } catch (error) {
        console.error(error);
        if (isAxiosError(error)) {
          const data = error.response?.data;
          toast.error(data.msg);
        }
      }
    },
    [getValues, showPassword, handleSubmit],
  );

  return (
    <div className="relative w-full grow overflow-x-hidden text-white flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg z-10"
      >
        <div className="relative sm:rounded-[28px] sm:border sm:border-border sm:bg-card/80 backdrop-blur-2xl p-4 sm:p-10 sm:shadow-lg">
          <div className="relative ">
            <h2 className="text-2xl sm:text-3xl text-center tracking-tight leading-tight font-semibold text-gray-800 mb-10">
              Get productive
            </h2>
            {/* Google Sign-In Button */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-[#9EA0BB] text-sm font-medium">
                Or Continue with email
              </span>
              <div className="flex-1 border-t border-border"></div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="flex flex-col gap-y-6">
                <label>
                  <span className="text-black mb-2 block text-sm font-medium leading-nones">
                    Email
                  </span>
                  <InputBox
                    label="Email"
                    placeholder="You@example.com"
                    Type="email"
                    required
                    register={register("email", {
                      required: "email is required",
                    })}
                    autoComplete="email"
                  ></InputBox>
                </label>
                {showPassword && (
                  <label>
                    <span className="text-black mb-2 block text-sm font-medium leading-none">
                      Password
                    </span>
                    <InputBox
                      label="Password"
                      placeholder="password"
                      Type="password"
                      required
                      min={8}
                      autoComplete="new-password"
                      register={register("password", {
                        required: "password is required",
                      })}
                    ></InputBox>
                    <FormProvider {...form}>
                      <PasswordRequirements />
                    </FormProvider>
                  </label>
                )}
                <Button
                  isSubmitting={isSubmitting}
                  Initial="Create Account"
                  Loading="Creating Account..."
                  size="sm"
                />
              </div>
            </form>
            <div className="text-center text-muted-foreground mt-4 font-light">
              Already have an account?{" "}
              <button
                onClick={() => {
                  navigate("/signin");
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpForm;
