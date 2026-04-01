import { isAxiosError } from "axios";
import { useEffect, useRef } from "react";
import InputBox from "../../InputBox";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "../../Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import { Auth, type AuthMethod } from "@/Context/AuthContext";
import { GoogleSignInButton } from "../../GoogleSignInButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { Grid } from "@/features/ui/grid";
import LogoCard from "@/features/LogoCard";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Gradient } from "../../../Pages/onboarding/pages/Welcome";

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
    undefined,
  );

  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive,
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
        errorMessages[oauthError] || "Sign-in failed. Please try again.",
      );
      navigate("/signin", { replace: true });
    }
  }, [searchParams, navigate]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await api.post("/v1/user/signin", data);
      await refreshAuth();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-white flex flex-col items-center justify-center px-4">
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 w-full -translate-x-1/2",
          "mask-intersect mask-[linear-gradient(black,transparent_1000px),linear-gradient(90deg,transparent,black_5%,black_100%,transparent)]",
        )}
      >
        <Grid
          cellSize={60}
          patternOffset={[0.75, 0]}
          className="text-neutral-200"
        />
      </div>
      <button
        onClick={() => {
          navigate("/");
        }}
        className="text-slate-600 hidden lg:block hover:text-slate-900 absolute top-10 left-10 gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md"
      >
        <div className="flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <p className="font-medium">Back to home</p>
        </div>
      </button>
      <div className="grow max-h-50 sm:max-h-75  pt-6 sm:pt-10 relative">
        <Gradient className="opacity-5 mix-blend-overlay" />
        <LogoCard className="z-10" />
        <Gradient className="opacity-10 mix-blend-hard-light" />
      </div>
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
                  Loading="Signing in..."
                  Initial="Sign in"
                  onClick={() => {
                    setLastUsedAuthMethod("email");
                  }}
                  size="small"
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
    </div>
  );
};

export default SignInForm;
