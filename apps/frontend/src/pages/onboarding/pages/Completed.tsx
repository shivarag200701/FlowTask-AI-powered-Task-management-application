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
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.25, delayChildren: 0.15 },
          },
        }}
        className="flex flex-col gap-15 items-center justify-center max-w-sm sm:max-w-lg"
      >
        <motion.div
          className="h-40 w-40 bg-white rounded-full shadow-lg relative flex justify-center"
          variants={{
            hidden: { opacity: 0, scale: 0.8, filter: "blur(8px)" },
            show: {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: { type: "spring", stiffness: 60, damping: 16 },
            },
          }}
        >
          <CircleCheckBig
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-primary"
            size={80}
          />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0, rotate: -30 },
              show: {
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.5,
                },
              },
            }}
            className="absolute right-0"
          >
            <Sparkles
              className="text-[#5152bf] bg-[#e1dfff] p-2 rounded-2xl w-10 h-12"
              size={40}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0, rotate: 30 },
              show: {
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.7,
                },
              },
            }}
            className="absolute left-0 bottom-0"
          >
            <Award
              className="text-[#895300] p-2 bg-[#f3e1d3] rounded-xl"
              size={40}
            />
          </motion.div>
        </motion.div>
        <div className="flex flex-col gap-6">
          <motion.h1
            className="text-5xl text-center font-bold text-neutral-800"
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 80, damping: 20 },
              },
            }}
          >
            You're all set, {user?.name}!
          </motion.h1>
          <motion.p
            className="text-lg text-center text-gray-500"
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 80, damping: 20 },
              },
            }}
          >
            Your workspace is ready. Let's start organizing your flow and
            reaching your goals
          </motion.p>
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { type: "spring", stiffness: 80, damping: 20 },
            },
          }}
        >
          <Button
            Initial="Go to your dashboard"
            type="button"
            onClick={() => {
              navigate("/app/today");
            }}
            size="lg"
          />
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};
