import { Command } from "cmdk";
import { Kbd } from "./ui/kbd";
import { Popover } from "./ui/popover";
import { Button } from "./ui/button";
import { Plus, Tag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { isValidElement, useEffect, useState, type ReactNode } from "react";
import { Checkbox } from "./ui/checkbox";
import { getResourceColors } from "@/utils/functions/getTagColors";
import AnimatedSizeContainer from "./ui/animated-size-container";
import ScrollContainer from "./ui/scroll-container";
import { useHotkeys } from "react-hotkeys-hook";

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
  shouldFilter?: boolean;
  searchValue: string;
  setSearchValue: (serach: string) => void;
};

function ComboBox({
  open,
  onOpenChange,
  placeholder = "search...",
  children,
  options,
  selectedTags,
  setSelectedTags,
  shouldFilter = true,
  searchValue,
  setSearchValue,
}: ComboBoxProps<any>) {
  const handleSelect = (option: ComboBoxOptions<any>) => {
    setSelectedTags?.(option);
  };

  //Currenlty all the filtering is in client side, we need to implement a server side filtering

  const [hoveredIndex, setHoveredIndex] = useState(0);

  useHotkeys(
    "down",
    () => {
      if (options && hoveredIndex + 1 > options?.length - 1) return;
      setHoveredIndex((prev) => prev + 1);
    },
    { enableOnFormTags: true },
  );
  useHotkeys(
    "up",
    () => {
      if (hoveredIndex - 1 < 0) return;
      setHoveredIndex((prev) => prev - 1);
    },
    { enableOnFormTags: true },
  );

  useEffect(() => {
    setHoveredIndex(0);
  }, [searchValue]);

  const hoveredItem = options?.[hoveredIndex]?.value;

  return (
    <Popover
      openPopover={open}
      setOpenPopover={onOpenChange}
      content={
        <AnimatedSizeContainer height>
          <Command
            label="Command Menu"
            className="w-[390px]"
            loop
            shouldFilter={shouldFilter}
            filter={(value, serach) => {
              console.log(serach);

              if (value.includes(serach)) return 1;
              return 0;
            }}
          >
            <div className="relative flex items-center">
              <Command.Input
                className=" pl-4 py-3 focus:outline-none text-sm "
                placeholder="search or add tags..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <Kbd className="absolute right-2">T</Kbd>
            </div>
            <Command.Separator
              className="border-t border-border"
              alwaysRender
            />
            <ScrollContainer className="max-h-[300px]">
              <Command.List className="p-1">
                {searchValue.length > 0 && (
                  <NewOption searchValue={searchValue} />
                )}
                {options?.map((option) => (
                  <Option
                    selected={
                      selectedTags?.some(
                        ({ value }) => option.value === value,
                      ) ?? false
                    }
                    option={option}
                    onSelect={() => handleSelect(option)}
                    key={option.value}
                    hoveredItem={hoveredItem}
                  />
                ))}
              </Command.List>
            </ScrollContainer>
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
        type="button"
      />
    </Popover>
  );
}

type OptionsProps = {
  option: ComboBoxOptions;
  selected: boolean;
  onSelect: () => void;
  hoveredItem: string | undefined;
};

function NewOption({ searchValue }: { searchValue: string }) {
  return (
    <Command.Item
      className="hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center"
      forceMount
    >
      <Plus className="w-4 h-4 text-neutral-500" />
      <span>{searchValue ? `Create "${searchValue}"` : "...new option"}</span>
    </Command.Item>
  );
}

function Option({ option, selected, onSelect, hoveredItem }: OptionsProps) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center",
        hoveredItem === option.value && "bg-accent",
      )}
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
