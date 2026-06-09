import { Check } from "lucide-react";

function SuccessIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-background" />
    </div>
  );
}

export default SuccessIcon;
