import { aiParseTask } from "@/api/ai";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useParseTask() {
  return useMutation({
    mutationFn: async ({ input }: { input: string }) => aiParseTask({ input }),
    onSuccess: () => {
      toast.success("Task parsed successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const errorMsg = error.response?.data.msg;
        toast.error(errorMsg);
        return;
      }
      toast.error("something went wrong");
    },
  });
}
