import { isAxiosError } from "axios";
import { useCallback, useEffect, useState} from "react";
import InputBox from "../../InputBox";
import LogoCard from "../../LogoCard";
import { Mail } from "lucide-react";
import { Lock, ArrowLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "../../Button";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { Auth } from "@/Context/AuthContext";
import { GoogleSignInButton } from "../../GoogleSignInButton";
import { PasswordRequirements } from "./PasswordRequirements";
import {toast} from "sonner"
import { useSignupContext } from "@/Context/SingupContext";

type Inputs = {
  email: string;
  password: string;
};

const SignUpForm = () => {

  const form = useForm<Inputs>()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = form

  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth } = Auth();

  const {setStep, setEmail, setPassword} = useSignupContext()


  useEffect(() => {
    if(isAuthenticated){
      navigate("/dashboard");
    }
  }, [isAuthenticated]);
  const onSubmit: SubmitHandler<Inputs> = useCallback(async (data) => {
    const {email,password} = getValues()

    if(email && !password && !showPassword){
      setShowPassword(true)
      return;
    }
    try {
      await api.post("/v1/user/signup/send-otp", data);
      setEmail(getValues("email"))
      setPassword(getValues("password"))
      setStep("verify")
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) {
        const data = error.response?.data
        toast.error(data.msg)
      }
    }
  },[getValues, showPassword, handleSubmit]);

  return (
    <div className="relative w-full grow overflow-x-hidden bg-white text-white flex items-start justify-center">
      <div className="relative w-full max-w-xl">
        <div className="relative sm:rounded-[28px] sm:border sm:border-border bg-card/80 backdrop-blur-2xl p-8 sm:p-10 sm:shadow-xl">
          <div className="relative ">
            <h2 className="text-3xl text-center tracking-tight leading-tight font-medium text-gray-800 mb-10">Get productive</h2>
            {/* Google Sign-In Button */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-[#9EA0BB] text-sm font-medium">Or Continue with email</span>
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
                    register={register("email", { required: "email is required" })}
                    autoComplete="email"
                  >
                    <Mail className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
                  </InputBox>
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
                    >
                      <Lock className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
                    </InputBox>
                    <FormProvider {...form}>
                      <PasswordRequirements/>
                    </FormProvider>
                  </label>
                )}
                <Button
                  isSubmitting={isSubmitting}
                  Initial="Create Account"
                  Loading="Creating Account..."
                />
              </div>
            </form>
            <div className="text-center text-muted-foreground mt-4 font-light">
              Already have an account?{" "}
              <button onClick={() => {navigate('/signin')}} className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
