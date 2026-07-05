import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SignInForm from "@/features/auth/signin/SignInForm";
import { Auth } from "@/context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth } = Auth();

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      console.error("OAuth error:", error);
      // Error will be handled by showing a message or redirecting
    }

    if (success === "google_sign_in") {
      // User successfully signed in with Google
      refreshAuth().then(() => {
        const callbackUrl = searchParams.get("callbackUrl");
        navigate(callbackUrl ?? "/app/today", { replace: true });
      });
    }
  }, [searchParams, navigate, refreshAuth]);

  return <SignInForm />;
};

export default SignIn;
