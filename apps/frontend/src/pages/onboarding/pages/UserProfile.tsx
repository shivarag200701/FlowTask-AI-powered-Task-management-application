import InputBox from "@/features/_legacy/InputBox";
import ImageUpload from "@/features/auth/onboarding/ImageUpload";
import { motion } from "motion/react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Gradient } from "@/components/ui/gradient";
import { Button } from "@/components/ui/button";
import UseOnboardingProgess from "@/features/auth/onboarding/Use-onboarding-progess";
import { useMutation } from "@tanstack/react-query";
import { saveUserProfile } from "@/api/user";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";

export type UserProfileFormValues = {
  name: string;
  photo?: File;
};

const UserProfile = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<UserProfileFormValues>();

  const { continueTo } = UseOnboardingProgess();

  const { mutate } = useMutation({
    mutationFn: (data: FormData) => saveUserProfile(data),
    onSuccess: () => {
      continueTo("completed");
    },
    onError: (error) => {
      console.error(error);
      if (isAxiosError(error)) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
    },
  });

  const onSubmit: SubmitHandler<UserProfileFormValues> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.photo) {
      formData.append("image", data.photo);
    }
    mutate(formData);
  };

  return (
    <AuthLayout
      logo="none"
      gridCellSize={10}
      showLogoHalo={false}
      showSignedInHint
    >
      <div className="relative z-10 max-w-sm sm:max-w-xl">
        <Gradient className="opacity-30 size-[500px] mix-blend-overlay -translate-y-10" />
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[28px] border border-border bg-white/90 backdrop-blur-2xl p-8 sm:p-10 shadow-xl grow flex flex-col item-center justify-center z-20"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-6">
              <h1 className="text-3xl font-bold text-center text-neutral-800 ">
                Create your profile
              </h1>
              <p className="p-2 text-gray-600 text-center">
                Add your name and avatar to get started with FlowTask.
              </p>
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <ImageUpload onChange={field.onChange} />
                )}
              />
              <div className="pt-3 text-center">
                <span className="text-primary uppercase font-semibold tracking-widest">
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
                />
              </label>
              <Button
                Initial="Create Profile"
                Loading="Creating Profile..."
                className="rounded-md mt-5"
                isSubmitting={isSubmitting}
                size="lg"
              />
            </div>
          </form>
        </motion.div>
        <Gradient className="opacity-10 mix-blend-hard-light" />
      </div>
    </AuthLayout>
  );
};

export default UserProfile;
