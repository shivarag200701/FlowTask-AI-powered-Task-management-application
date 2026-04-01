import { useQuery } from "@tanstack/react-query";
import Onboarding from "../Onboarding";
import { CircleCheckBig, Sparkles, Award } from "lucide-react";
import api from "@/utils/api";
import Button from "@/features/Button";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import type { User } from "@/types";

export const Completed = () => {
  const { data: user } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User> => {
      const res = await api.get("/v1/user/profile");
      return res.data.user;
    },
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Onboarding cellSize={40}>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-15 items-center justify-center max-w-sm sm:max-w-lg"
        >
          <div className="h-40 w-40 bg-white rounded-full shadow-lg relative flex justify-center">
            <CircleCheckBig
              className="absolute top-1/2 -translate-y-1/2  left-1/2 -translate-x-1/2 text-accent"
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
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </motion.div>
      </Onboarding>
    </div>
  );
};
