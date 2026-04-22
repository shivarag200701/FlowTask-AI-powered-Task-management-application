import { AlarmClock, Edit3Icon, LucideTrash } from "lucide-react";
import type { ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Kbd } from "../ui/kbd";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

type Option = {
  id: string;
  icon: ReactNode;
  iconColor?: string;
  label: string;
  hotKey?: string;
  onClick?: () => void;
};

function MoreOptionsDropDown({
  onDelete,
  className,
}: {
  onDelete: () => void;
  className?: string;
}) {
  const { isMobile } = useMediaQuery();

  const editOptions: Option[] = [
    { id: "edit", icon: <Edit3Icon />, label: "Edit", hotKey: "⌘ E" },
    { id: "reminders", icon: <AlarmClock />, label: "Reminders" },
  ];

  const taskOptions: Option[] = [
    {
      id: "delete",
      icon: <LucideTrash />,
      iconColor: "#FF0000",
      label: "Delete",
      hotKey: "⌘ ⌫",
      onClick: onDelete,
    },
  ];

  //move to a seprate hook for abstraction
  useHotkeys("mod+backspace", onDelete);

  return (
    <div
      className={cn(
        `w-full sm:w-[200px] flex flex-col text-sm sm:text-[13px] font-light`,
        className,
      )}
    >
      <div className="p-2 w-full flex flex-col border-b">
        {editOptions.map((option) => (
          <button
            key={option.id}
            className="flex items-center justify-between  px-3 py-2 hover:bg-accent hover:cursor-pointer rounded-md tranistion-all duration-100"
            type="button"
            onClick={option.onClick}
          >
            <div
              className="flex gap-5 sm:gap-2 items-center"
              style={{ color: option.iconColor }}
            >
              <div className="[&_svg]:size-5 sm:[&_svg]:size-4">
                {option.icon}
              </div>
              <span className="font-semibold flex items-center">
                {option.label}
              </span>
            </div>
            <div>
              {option.hotKey && !isMobile && (
                <Kbd className="text-[10px]">{option.hotKey}</Kbd>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 w-full flex flex-col">
        {taskOptions.map((option) => (
          <button
            key={option.id}
            className={`flex items-center justify-between  px-3 py-2 ${option.id === "delete" ? "hover:bg-red-500 hover:text-white" : "hover:bg-accent"}  hover:cursor-pointer rounded-md tranistion-all duration-100 group`}
            type="button"
            onClick={option.onClick}
          >
            <div
              className={`flex gap-5 sm:gap-2 items-center text-red-500 ${option.id === "delete" ? "group-hover:text-white" : ""}`}
              // style={{ color: option.iconColor }}
            >
              <div className="[&_svg]:size-5 sm:[&_svg]:size-4">
                {option.icon}
              </div>
              <span className="font-semibold">{option.label}</span>
            </div>
            <div>
              {option.hotKey && !isMobile && (
                <Kbd className="text-[10px]">{option.hotKey}</Kbd>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoreOptionsDropDown;
