import { ArrowRight, Calendar, RefreshCw } from "lucide-react";
import type { NLPDateParserProps } from "../types";

export default function NLPDateParser({
  onApply,
  nlpInput,
  setNlpInput,
  parsedResult,
}: NLPDateParserProps) {
  return (
    <div className="border-b border-border">
      <div
        className={`${parsedResult?.confidence === "high" ? "border-b border-border" : ""}`}
      >
        <input
          type="text"
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onApply();
            }
          }}
          placeholder="Type a date"
          className="w-full text-base sm:text-lg text-foreground placeholder:text-secondary focus:outline-none focus:border-ring bg-transparent h-10 px-3 "
        />
      </div>
      {parsedResult?.confidence === "high" && (
        <div className="mt-3 text-xs flex items-center gap-3 px-3">
          <div>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={onApply}
            >
              {parsedResult.isRecurring && (
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              )}
              {!parsedResult.isRecurring && (
                <Calendar className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="text-white text-[13px] flex items-center gap-1">
                {parsedResult.displayText}
                {parsedResult.isRecurring && (
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-4 h-4 text-white" /> Forever
                  </span>
                )}
              </div>
            </div>
            <div className="text-muted-foreground mt-3 text-[10px] pb-2">
              You can also type in recurring dates like{" "}
              <span className="text-gray-300">
                every day, every 2 weeks, and every month.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
