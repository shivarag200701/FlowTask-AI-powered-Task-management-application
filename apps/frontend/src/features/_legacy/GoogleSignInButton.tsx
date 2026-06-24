import { useState } from "react";
import api from "@/utils/functions/api";
import { Auth } from "@/context/AuthContext";
import { Google } from "@/components/ui/google";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/oauth/google/connect", {
        params: { callbackUrl },
      });
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
      variant="outline"
    />
  );
}
