import { Command } from "cmdk";
import { Kbd } from "./ui/kbd";
import { Popover } from "./ui/popover";
import { Button } from "./ui/button";
import { Tag, type IconNode } from "lucide-react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { useState, type ReactNode } from "react";

export type ComboBoxOptions<TMeta = any> = {
  value: string;
  label: string;
  meta?: TMeta;
  icon: IconNode | ReactNode;
};

export type ComboBoxProps<TMeta extends any> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  children?: ReactNode;
  options?: ComboBoxOptions<TMeta>[];
};

function ComboBox({
  open,
  onOpenChange,
  placeholder = "search...",
  children,
  options,
}: ComboBoxProps<any>) {
  const [selected, setSelected] = useState<string[]>([]);
  console.log(selected);

  return (
    <Popover
      openPopover={open}
      setOpenPopover={onOpenChange}
      content={
        <Command label="Command Menu" className="w-[390px]">
          <div className="relative flex items-center">
            <Command.Input
              className=" pl-4 py-3 focus:outline-none text-sm "
              placeholder="search or add tags..."
            />
            <Kbd className="absolute right-2">T</Kbd>
          </div>
          <Command.Separator className="border-t border-border" alwaysRender />
          <Command.List className="p-1">
            {options?.map((option) => (
              <Command.Item
                onSelect={(value) => setSelected((prev) => [...prev, value])}
                className="hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-2 items-center"
              >
                <div className="flex gap-2 items-center">
                  {option.icon}
                  {option.label}
                </div>
              </Command.Item>
            ))}
            <Command.Empty>No results found.</Command.Empty>
          </Command.List>
        </Command>
      }
    >
      <Button
        variant="outline"
        Initial={children ? children : placeholder}
        className={cn(
          "text-neutral-500 w-[390px] text-left flex justify-start hover:bg-none",
          outlinePopoverTriggerClasses,
        )}
        icon={<Tag />}
      />
    </Popover>
  );
}

export default ComboBox;
