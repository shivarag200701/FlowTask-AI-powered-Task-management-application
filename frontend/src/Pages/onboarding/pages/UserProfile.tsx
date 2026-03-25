import InputBox from "@/Components/InputBox";
import ProfileUpload from "../ProfileUpload";
import Onboarding from "../Onboarding";
import { motion } from "motion/react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { User } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Gradient } from "./Welcome";
import Button from "@/Components/Button";
import UseOnboardingProgess from "../UseOnboardingProgess";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type FormData = {
  name: string;
  photo?: File;
};

const UserProfile = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const { continueTo } = UseOnboardingProgess();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.photo) {
      formData.append("image", data.photo);
    }
    try {
      await api.post("/v1/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      //confirm that the name correct and retirved from the db for safe side, may remove it alter
      const res = await api.get("/v1/user/profile");
      if (!res.data.user) {
        navigate("/onboarding/welcome");
      }

      queryClient.setQueryData(["users"], res.data.user);
      continueTo("completed");
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Onboarding className="">
        <div className="relative z-10 max-w-sm sm:max-w-xl">
          <Gradient className="opacity-30 size-[700px] mix-blend-overlay -translate-y-10" />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[28px] border border-border bg-white/90 backdrop-blur-2xl p-8 sm:p-10 shadow-xl grow flex flex-col item-center justify-center z-20"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-6">
                <h1 className="text-3xl font-bold text-center ">
                  Create your profile
                </h1>
                <p className="p-2 text-gray-600 text-center">
                  Add your name and avatar to get started with FlowTask.
                </p>
                <Controller
                  control={control}
                  name="photo"
                  render={({ field }) => (
                    <ProfileUpload onChange={field.onChange} />
                  )}
                />
                <div className="pt-3 text-center">
                  <span className="text-accent uppercase font-semibold tracking-widest">
                    Change Photo
                  </span>
                  <p className="p-2 text-gray-400 text-center text-xs">
                    Maximum file size: 5MB
                  </p>
                </div>
                <label>
                  <span className="text-black mb-2 block text-sm font-medium leading-nones">
                    Full Name
                  </span>
                  <InputBox
                    label="Full name"
                    placeholder="e.g. Alex Rivera"
                    Type="text"
                    required
                    register={register("name", {
                      required: "name is required",
                    })}
                  >
                    <User className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
                  </InputBox>
                </label>
                <Button
                  Initial="Create Profile"
                  Loading="Creating Profile..."
                  className="rounded-md mt-5"
                  isSubmitting={isSubmitting}
                />
              </div>
            </form>
          </motion.div>
          <Gradient className="opacity-10 mix-blend-hard-light" />
        </div>
      </Onboarding>
    </div>
  );
};

export default UserProfile;
