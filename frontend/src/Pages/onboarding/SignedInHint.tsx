import Button from "@/Components/Button";
import { useState } from "react";

import { Auth } from "@/Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SignedInHint = () => {
  const { email } = Auth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      navigate("/signin");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const logout = async () => {
    await api.post("/v1/user/logout");
  };

  return (
    <div className="fixed bottom-0 left-0 m-5 z-40 flex flex-col items-start gap-2">
      <div className="flex items-center gap-1 text-xs">
        You're signed in as
        <span className="font-bold">{email}</span>
      </div>
      <Button
        isSubmitting={loading}
        Initial="Sign in as a different user"
        variant="secondary"
        size="small"
        className="w-fit rounded-md"
        onClick={() => {
          mutate();
        }}
      />
    </div>
  );
};

export default SignedInHint;
