import { AlarmClock, Edit3Icon, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Kbd } from "./ui/kbd";
import { useMediaQuery } from "@/hooks/use-media-query";

type Option = {
  id: string;
  icon: ReactNode;
  iconColor?: string;
  label: string;
  hotKey?: string;
  onClick?: () => void;
};

function MoreOptionsDropDown({ onDelete }: { onDelete: () => void }) {
  const { isMobile } = useMediaQuery();

  const Options: Option[] = [
    { id: "edit", icon: <Edit3Icon />, label: "Edit", hotKey: "⌘ E" },
    { id: "reminders", icon: <AlarmClock />, label: "Reminders" },
    {
      id: "delete",
      icon: <Trash2 />,
      iconColor: "#FF0000",
      label: "Delete",
      hotKey: "⌘ ⌫",
      onClick: onDelete,
    },
  ];

  //move to a seprate hook for abstraction
  useHotkeys("mod+backspace", onDelete);

  return (
    <div className="w-full sm:w-[200px] flex flex-col text-sm sm:text-[13px] font-light">
      {Options.map((option) => (
        <button
          key={option.id}
          className="flex items-center justify-between border-b last:border-none px-3 py-2 hover:bg-accent hover:cursor-pointer"
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
            <span>{option.label}</span>
          </div>
          <div>
            {option.hotKey && !isMobile && (
              <Kbd className="text-[10px]">{option.hotKey}</Kbd>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default MoreOptionsDropDown;
