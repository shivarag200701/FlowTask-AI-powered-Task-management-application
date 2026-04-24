import { Command } from "cmdk";
import { Kbd } from "./ui/kbd";
import { Popover } from "./ui/popover";
import { Button } from "./ui/button";
import { Tag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { isValidElement, useState, type ReactNode } from "react";
import { Checkbox } from "./ui/checkbox";
import { getResourceColors } from "@/utils/constants/tagColors";
import AnimatedSizeContainer from "./ui/animated-size-container";

export type ComboBoxOptions<TMeta = any> = {
  value: string;
  label: string;
  meta?: TMeta;
  icon: LucideIcon | ReactNode;
};

export type ComboBoxProps<TMeta extends any> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  children?: ReactNode;
  options?: ComboBoxOptions<TMeta>[];
  selectedTags?: ComboBoxOptions<TMeta>[];
  setSelectedTags?: (value: ComboBoxOptions<any>) => void;
};

function ComboBox({
  open,
  onOpenChange,
  placeholder = "search...",
  children,
  options,
  selectedTags,
  setSelectedTags,
}: ComboBoxProps<any>) {
  const handleSelect = (option: ComboBoxOptions<any>) => {
    setSelectedTags?.(option);
  };
  return (
    <Popover
      openPopover={open}
      setOpenPopover={onOpenChange}
      content={
        <AnimatedSizeContainer>
          <Command label="Command Menu" className="w-[390px]">
            <div className="relative flex items-center">
              <Command.Input
                className=" pl-4 py-3 focus:outline-none text-sm "
                placeholder="search or add tags..."
              />
              <Kbd className="absolute right-2">T</Kbd>
            </div>
            <Command.Separator
              className="border-t border-border"
              alwaysRender
            />
            <Command.List className="p-1">
              {options?.map((option) => (
                <Option
                  selected={
                    selectedTags?.some(({ value }) => option.value === value) ??
                    false
                  }
                  option={option}
                  onSelect={() => handleSelect(option)}
                  key={option.value}
                />
              ))}
              <Command.Empty>No results found.</Command.Empty>
            </Command.List>
          </Command>
        </AnimatedSizeContainer>
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

type OptionsProps = {
  option: ComboBoxOptions;
  selected: boolean;
  onSelect: () => void;
};

function Option({ option, selected, onSelect }: OptionsProps) {
  return (
    <Command.Item
      className="hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center"
      value={option.value + option.label}
      onSelect={onSelect}
    >
      <Checkbox
        className="size-3 rounded-xs border-border cursor-pointer"
        checked={selected}
      />
      <div className="flex gap-4 items-center">
        <div
          className={`bg-${getResourceColors({ color: option.meta.color })?.tagVariants}`}
        >
          {option.icon && (
            <span>{isValidElement(option.icon) && option.icon}</span>
          )}
        </div>
        <span>{option.label}</span>
      </div>
    </Command.Item>
  );
}

export default ComboBox;
