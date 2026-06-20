import { useQuery } from "@tanstack/react-query";
import { CircleCheckBig, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { authQueryKeys } from "@/query-keys";
import { getCurrentUser } from "@/api";
import AuthLayout from "@/layouts/AuthLayout";

export const Completed = () => {
  const { data: user } = useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getCurrentUser,
  });

  const navigate = useNavigate();

  return (
    <AuthLayout
      logo="none"
      gridCellSize={40}
      showLogoHalo={false}
      showSignedInHint
    >
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-15 items-center justify-center max-w-sm sm:max-w-lg"
      >
        <div className="h-40 w-40 bg-white rounded-full shadow-lg relative flex justify-center">
          <CircleCheckBig
            className="absolute top-1/2 -translate-y-1/2  left-1/2 -translate-x-1/2 text-primary"
            size={80}
          />
          <Sparkles
            className="absolute right-0 text-[#5152bf] bg-[#e1dfff] p-2 rounded-2xl w-10 h-12"
            size={40}
          />
          <Award
            className="absolute left-0 bottom-0 text-[#895300] p-2 bg-[#f3e1d3] rounded-xl"
            size={40}
          />
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl text-center font-bold">
            You're all set, {user?.name}!
          </h1>
          <p className="text-lg text-center text-gray-500">
            Your workspace is ready. Let's start organizing your flow and
            reaching your goals
          </p>
        </div>
        <Button
          Initial="Go to your dashboard"
          type="button"
          onClick={() => {
            navigate("/app/today");
          }}
        />
      </motion.div>
    </AuthLayout>
  );
};
