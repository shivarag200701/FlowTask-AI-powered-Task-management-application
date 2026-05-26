import { cn } from "@/lib/utils";

interface TabSwitcherProps<T extends string> {
  tabs: readonly T[];
  selectedTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
}

export function TabSwitcher<T extends string>({
  tabs,
  selectedTab,
  onTabChange,
  className,
}: TabSwitcherProps<T>) {
  return (
    <div
      className={cn(
        "relative h-9 rounded-full w-fit bg-neutral-100 flex p-1 gap-0.5 text-sm items-center",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          className={cn(
            "relative z-10 py-1 px-4 rounded-full cursor-pointer text-neutral-500 transition-colors duration-200",
            selectedTab === tab &&
              "text-neutral-900 bg-white shadow-sm font-medium"
          )}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
