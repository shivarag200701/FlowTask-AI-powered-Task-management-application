import { SpinnerCustom } from "@/components/ui/spinner";

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <img src="/logo.png" alt="Logo" width={100} height={100} />
      <SpinnerCustom />
    </div>
  );
}
