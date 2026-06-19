import { useCallback, useState } from "react";

export const useCopyToClipboard = (): [
  boolean,
  (
    value: string,
    options?: { onSuccess?: () => void; throwOnError?: boolean }
  ) => Promise<void>,
] => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = useCallback(
    async (
      value: string,
      {
        onSuccess,
        throwOnError,
      }: { onSuccess?: () => void; throwOnError?: boolean } = {}
    ) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onSuccess?.();
      } catch (error) {
        console.error("Failed to copy: ", error);
        if (throwOnError) throw error;
      }
    },
    []
  );

  return [copied, copyToClipboard];
};
