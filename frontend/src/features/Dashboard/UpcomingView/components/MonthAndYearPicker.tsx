import Button from "@/features/Button";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getMonths, isPastDate, getYears } from "@/utils/monthYearPicker";
import { ChevronDown } from "lucide-react";
import type { DateTime } from "luxon";
import type { Dispatch, SetStateAction } from "react";

interface MonthAndYearPickerProps {
  startDate: DateTime;
  selectMonthYear: (year: number, month: number) => void;
  currentMonthYearLabel: string;
  isMonthYearPickerOpen: boolean;
  setIsMonthYearPickerOpen: Dispatch<SetStateAction<boolean>>;
}

export function MonthAndYearPicker({
  startDate,
  selectMonthYear,
  currentMonthYearLabel,
  isMonthYearPickerOpen,
  setIsMonthYearPickerOpen,
}: MonthAndYearPickerProps) {
  return (
    <Popover
      content={
        <div className="w-full divide-y divide-neutral-200 text-sm md:w-80 p-3">
          <div className="grid grid-cols-2 gap-6">
            {/* Month Selector */}
            <div>
              <div className="text-foreground text-sm font-semibold mb-3 text-center">
                Month
              </div>
              <div className="grid grid-cols-3 gap-2 overflow-hidden">
                {getMonths(startDate.year).map((month) => {
                  const isSelected = startDate.month === month.value;
                  const isDisabled = isPastDate(startDate.year, month.value);

                  return (
                    <button
                      key={month.value}
                      onClick={() => {
                        if (!isDisabled) {
                          selectMonthYear(startDate.year, month.value);
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer select-none ${
                        isSelected
                          ? "bg-accent text-white shadow-md  cursor-pointer"
                          : isDisabled
                            ? "text-[#4A4A4A] cursor-not-allowed opacity-40"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
                      }`}
                    >
                      {month.label.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Selector */}
            <div>
              <div className="text-foreground text-sm font-semibold mb-3 text-center">
                Year
              </div>
              <div className="max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
                {getYears().map((year) => {
                  const isSelected = startDate.year === year;
                  const isCurrentYear = year === new Date().getFullYear();

                  return (
                    <button
                      key={year}
                      onClick={() => {
                        // If selecting current year, ensure we don't go to past months
                        const today = new Date();
                        const monthToUse = isCurrentYear
                          ? Math.max(startDate.month, today.getMonth())
                          : startDate.month;
                        selectMonthYear(year, monthToUse);
                      }}
                      className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer select-none ${
                        isSelected
                          ? "bg-accent text-white shadow-md font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[#9EA0BB] text-xs text-center">
              Only future dates are available
            </div>
          </div>
        </div>
      }
      openPopover={isMonthYearPickerOpen}
      setOpenPopover={setIsMonthYearPickerOpen}
      popoverContentClassName="shadow-md"
    >
      <Button
        variant="secondary"
        Initial={
          <div className="flex w-full gap-2  items-center">
            <span className="grow text-left">{currentMonthYearLabel}</span>
            <ChevronDown
              className={cn("h-4 w-4 text-neutral-400 transition-transform", {
                "rotate-180": isMonthYearPickerOpen,
              })}
            />
          </div>
        }
        size="small"
      />
    </Popover>
  );
}
