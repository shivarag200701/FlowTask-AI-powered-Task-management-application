import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
const LogoCard = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-3 cursor-pointer hover-elevate rounded-2xl transition-all",
        className,
      )}
      onClick={() => navigate("/")}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
        <img src="/logo.png" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        FlowTask
      </h1>
    </div>
  );
};

export default LogoCard;
