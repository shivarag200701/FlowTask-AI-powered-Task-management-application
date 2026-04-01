import { useState } from "react";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";
import { Google } from "./ui/google";
import Button from "./Button";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/oauth/google/connect");
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Failed to initiate Google sign-in:", error);
      setLoading(false);
    }
  };

  const { setLastUsedAuthMethod } = Auth();

  return (
    <Button
      Initial="Continue with Google"
      Loading="Continue with Google"
      size="lg"
      onClick={() => {
        handleGoogleSignIn();
        setLastUsedAuthMethod("google");
      }}
      className="w-full "
      icon={<Google className="w-5 h-5" />}
      isSubmitting={loading}
      variant="secondary"
    />
  );
}
