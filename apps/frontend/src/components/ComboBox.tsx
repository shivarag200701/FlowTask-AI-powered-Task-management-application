import { Command } from "cmdk";
import { Kbd } from "./ui/kbd";
import { Popover } from "./ui/popover";
import { Button } from "./ui/button";
import { Plus, Tag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { isValidElement, useState, type ReactNode } from "react";
import { Checkbox } from "./ui/checkbox";
import { getResourceColors } from "@/utils/functions/tag-colors";
import AnimatedSizeContainer from "./ui/animated-size-container";
import { SpinnerCustom } from "./ui/spinner";
import { ScrollContainer } from "./ui/scroll-container";

//kept sorting simple by using built in sorting from cmdk, need to upgrade later
export type SubOption = {
  value: string;
  label: string;
  icon: LucideIcon | ReactNode;
};

export type ComboBoxOptions<TMeta = any> = {
  value: string;
  label: string;
  optionSelected?: boolean;
  optionId?: string;
  meta?: TMeta;
  icon: LucideIcon | ReactNode;
  subOptions?: SubOption[];
};

export type ComboBoxProps<TMeta extends any> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  children?: ReactNode;
  options?: ComboBoxOptions<TMeta>[];
  selectedOptions?: ComboBoxOptions<TMeta>[];
  //multiple select
  setSelectedOptions?: (value: ComboBoxOptions<any>) => void;
  //single select
  onSelect?: (value: ComboBoxOptions<any>) => void;
  shouldFilter?: boolean;
  searchValue: string;
  setSearchValue: (search: string) => void;
  triggerClassName?: string;
  matchTriggerWidth?: boolean;
  contentClassName?: string;
  multiple?: boolean;
  onCreate?: (tagName: string) => Promise<void>;
  loading?: boolean;
  isPending?: boolean;
  trigger?: boolean;
  inputBoxText?: string;
  icon?: ReactNode;
};

function ComboBox({
  open,
  onOpenChange,
  placeholder = "search...",
  children,
  options,
  selectedOptions,
  onSelect,
  setSelectedOptions,
  shouldFilter = false,
  searchValue,
  setSearchValue,
  triggerClassName,
  matchTriggerWidth,
  contentClassName,
  multiple = false,
  onCreate,
  loading,
  trigger = false,
  inputBoxText,
  icon,
}: ComboBoxProps<any>) {
  const handleSelect = (option: ComboBoxOptions<any>) => {
    if (!multiple) {
      onSelect?.(option);
      return;
    }
    setSelectedOptions?.(option);
  };

  const [isCreating, setIsCreating] = useState(false);
  //Currenlty all the filtering is in client side, we need to implement a server side filtering

  return (
    <Popover
      openPopover={open}
      setOpenPopover={onOpenChange}
      popoverContentClassName={cn(
        matchTriggerWidth && "sm:w-[var(--radix-popover-trigger-width)]",
        contentClassName
      )}
      content={
        <AnimatedSizeContainer height>
          <Command
            label="Command Menu"
            loop
            className="w-full"
            shouldFilter={shouldFilter}
            filter={(value, search) => {
              if (value.includes(search)) return 1;
              return 0;
            }}
          >
            <div className="relative flex items-center">
              <Command.Input
                className=" pl-4 py-3 focus:outline-none text-sm"
                placeholder={inputBoxText}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <Kbd className="absolute right-2">T</Kbd>
            </div>
            <Command.Separator
              className="border-t border-border"
              alwaysRender
            />
            <ScrollContainer
              className={cn(
                "max-h-[min(50vh,250px)]",
                onCreate && !multiple && "max-h-[calc(min(50vh,250px)-3.5rem)]"
              )}
            >
              <Command.List className="p-1">
                {loading ? (
                  <Command.Loading>
                    <div className="h-12 flex items-center justify-center">
                      <SpinnerCustom />
                    </div>
                  </Command.Loading>
                ) : (
                  <>
                    {searchValue.length > 0 && onCreate && (
                      <CreateNewOption
                        searchValue={searchValue}
                        isCreating={isCreating}
                        setIsCreating={setIsCreating}
                        onCreate={onCreate}
                      />
                    )}
                    {options?.map((option) => (
                      <Option
                        selected={
                          selectedOptions?.some(
                            ({ value }) => option.value === value
                          ) ?? false
                        }
                        option={option}
                        onSelect={({ option, subOption }) => {
                          if (option) handleSelect(option);
                          if (subOption) handleSelect(subOption);
                        }}
                        key={option.value}
                        multiple={multiple}
                      />
                    ))}
                  </>
                )}
              </Command.List>
              {!onCreate && (
                <Command.Empty className="flex justify-center items-center h-12 text-neutral-500 text-sm">
                  No matches
                </Command.Empty>
              )}
            </ScrollContainer>
          </Command>
        </AnimatedSizeContainer>
      }
      onWheel={(e) => {
        e.stopPropagation();
      }}
    >
      {trigger ? (
        <Button
          variant="outline"
          className={cn(
            "text-neutral-500  text-left flex justify-start hover:bg-none h-auto w-full overflow-hidden",
            outlinePopoverTriggerClasses,
            triggerClassName
          )}
          icon={icon ? icon : <Tag />}
          type="button"
        >
          {children ? children : placeholder}
        </Button>
      ) : (
        <button>{children ? children : placeholder}</button>
      )}
    </Popover>
  );
}

type OptionsProps = {
  option: ComboBoxOptions;
  selected: boolean;
  onSelect: ({
    option,
    subOption,
  }: {
    option?: ComboBoxOptions;
    subOption?: SubOption;
  }) => void;
  multiple?: boolean;
};

type CreateNewOptions = {
  searchValue: string;
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
  onCreate: (value: string) => Promise<void>;
};

function CreateNewOption({
  searchValue,
  isCreating,
  setIsCreating,
  onCreate,
}: CreateNewOptions) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center",
        "data-[selected=true]:bg-accent"
      )}
      forceMount
      onSelect={async () => {
        setIsCreating(true);
        try {
          await onCreate(searchValue);
        } finally {
          setIsCreating(false);
        }
      }}
    >
      {isCreating ? (
        <SpinnerCustom />
      ) : (
        <Plus className="w-4 h-4 text-neutral-500" />
      )}
      <span>{searchValue ? `Create "${searchValue}"` : "...new option"}</span>
    </Command.Item>
  );
}

function Option({ option, selected, onSelect, multiple }: OptionsProps) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer py-1 text-sm flex flex-col gap-1 w-full overflow-hidden",
        multiple
          ? "px-3 rounded-md hover:bg-accent data-[selected=true]:bg-accent"
          : "bg-transparent!"
      )}
      value={option.value + option.label}
      // onSelect={onSelect}
    >
      <div
        className={cn(
          "flex gap-2 items-center rounded-md px-3 py-1 w-full",
          !multiple && "hover:bg-accent/50 transition-colors"
        )}
        onClick={() => {
          onSelect({ option });
        }}
      >
        {multiple && (
          <Checkbox
            className="size-3 rounded-xs border-border cursor-pointer"
            checked={selected}
          />
        )}
        <div
          className={`bg-${getResourceColors({ color: option?.meta?.color })?.tagVariants}`}
        >
          {option.icon && (
            <span>{isValidElement(option.icon) && option.icon}</span>
          )}
        </div>
        <span className="flex-1">{option.label}</span>
        <span className="text-neutral-500">{option.meta?.count?.todos}</span>
      </div>
      {option.subOptions && option.subOptions.length > 0 && (
        <div className="flex flex-col gap-1 w-full">
          {option.subOptions.map((subOption) => (
            <div
              className={cn(
                "flex gap-2 items-center py-1 pl-9 pr-3 rounded-md",
                !multiple && "hover:bg-accent/50 transition-colors"
              )}
              key={subOption.value}
              onClick={() => onSelect({ subOption })}
            >
              {subOption.icon && (
                <span>{isValidElement(subOption.icon) && subOption.icon}</span>
              )}
              <span>{subOption.label}</span>
            </div>
          ))}
        </div>
      )}
    </Command.Item>
  );
}

export default ComboBox;
