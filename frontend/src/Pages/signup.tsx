import { SignupProvider, useSignupContext } from "@/Context/SingupContext";
import SignUpForm from "../Components/auth/signup/SignUpForm";
import LogoCard from "@/Components/LogoCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import VerfiyForm from "@/Components/auth/signup/VerfiyForm";

const Signup = () => {
  return (
    <>
      <SignupProvider>
        <SignupFlow/>
      </SignupProvider>
    </>
  );
};

const Verify = () => {

  const {email} = useSignupContext()
  return(
    <div className="w-full grow flex items-start justify-center">
      <div className="flex flex-col items-center text-center gap-1">
        <h3 className="text-center text-xl font-semibold">
            Verify your email address
        </h3>
        <p className="text-base font-medium text-neutral-500">
            Enter the six digit verification code sent to{" "}
          <strong className="font-semibold text-neutral-600" title={email}>
            {email}
          </strong>
        </p>
        <div className="mt-12 w-full">
          <VerfiyForm/>
        </div>
      </div>
    </div>
  )
}

const SignupFlow = () => {
  const navigate = useNavigate()
  const {step} = useSignupContext()
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white ">
          <button onClick={() => {navigate('/')}} className="text-slate-600 hidden lg:block hover:text-slate-900  absolute top-10 left-10 flex gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4"/>
              <p className="font-medium">Back to home</p>
            </div>
          </button>
        <div className="grow max-h-75 pt-10">
          <LogoCard/>
        </div>
        {step === "signup" && (
          <SignUpForm/>)
          }
        {step === "verify" && (
          <Verify/>
        )}
      </div>
    </>
  )
}

export default Signup;
