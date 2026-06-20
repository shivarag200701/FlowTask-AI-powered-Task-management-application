import { isAxiosError } from "axios";
import { useEffect, useRef } from "react";
import InputBox from "@/features/_legacy/InputBox";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/utils/functions/api";
import { Auth, type AuthMethod } from "@/context/AuthContext";
import { GoogleSignInButton } from "@/features/_legacy/GoogleSignInButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/AuthLayout";

type Inputs = {
  username: string;
  email: string;
  password: string;
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth, setLastUsedAuthMethod } = Auth();

  const [lastUsedAuthMethodLive] = useLocalStorage<AuthMethod | undefined>(
    "last-used-auth-method",
    undefined
  );

  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive
  );

  // Handle OAuth errors from URL params
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        access_denied: "You cancelled the sign-in process.",
        missing_code: "Sign-in failed. Please try again.",
        invalid_state: "Security verification failed. Please try again.",
        expired_state: "Sign-in session expired. Please try again.",
        oauth_failed: "Sign-in failed. Please try again.",
      };
      toast.error(
        errorMessages[oauthError] || "Sign-in failed. Please try again."
      );
      navigate("/signin", { replace: true });
    }
  }, [searchParams, navigate]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await api.post("/api/v1/user/signin", data);
      setLastUsedAuthMethod("email");
      await refreshAuth();
      navigate("/app/today");
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
    }
  };

  return (
    <AuthLayout showBackButton>
      <div className="relative z-10 w-full max-w-lg grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative sm:rounded-[28px] sm:border border-border  sm:bg-white/90 backdrop-blur-2xl p-4 sm:p-10 sm:shadow-xl"
        >
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-semibold text-center text-slate-900 mb-10">
              Welcome Back
            </div>
            {/* Google Sign-In Button */}
            <div className="mb-3">
              <GoogleSignInButton />
            </div>
            {lastUsedAuthMethod && (
              <div className="text-center text-xs">
                <p className="text-neutral-500">
                  You signed in with{" "}
                  <span className="font-semibold">
                    {lastUsedAuthMethod.charAt(0).toUpperCase() +
                      lastUsedAuthMethod.slice(1)}{" "}
                  </span>
                  last time
                </p>
              </div>
            )}
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-[#9EA0BB] text-sm font-medium">
                Or continue with email
              </span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    error={errors.email ? true : false}
                  ></InputBox>
                </label>

                <label>
                  <span className="text-black mb-2 block text-sm font-medium leading-none">
                    Password
                  </span>
                  <InputBox
                    label="Password"
                    placeholder="Password"
                    Type="password"
                    register={register("password", {
                      required: "password is required",
                    })}
                    error={errors.password ? true : false}
                  ></InputBox>
                </label>
                <Button
                  isSubmitting={isSubmitting}
                  Initial="Log in with email"
                  Loading="Log in with email"
                  size="lg"
                />
              </div>
            </form>
            <div className="text-center text-muted-foreground mt-8 font-light text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  navigate("/signup");
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default SignInForm;
