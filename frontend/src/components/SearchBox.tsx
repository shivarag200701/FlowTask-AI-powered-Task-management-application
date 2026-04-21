import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

interface SerachBoxProps {
  onChangeDebounced?: (value: string) => void;
  debounceTimeoutMs?: number;
  value: string;
  setValue: (value: string) => void;
}

const HOTKEYS = {
  focus: "slash",
  blur: "escape",
};

export function SearchBox({
  onChangeDebounced,
  debounceTimeoutMs = 500,
  value,
  setValue,
}: SerachBoxProps) {
  const debounce = useDebouncedCallback((value) => {
    onChangeDebounced?.(value);
  }, debounceTimeoutMs);
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys(
    ["slash", "escape"],
    (e, handler) => {
      if (inputRef.current) {
        const target = e.target as HTMLElement;

        switch (handler.keys?.join("")) {
          case "slash":
            if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")
              inputRef.current.focus();
            break;
          case "escape":
            console.log("esacpe here");
            inputRef.current.blur();
            break;
        }
      }
    },
    { preventDefault: true, enableOnFormTags: true },
  );
  return (
    <div className="relative mb-5">
      <div className="absolute inset-y-0 pl-4 flex items-center">
        <Search className="w-4 h-5 text-neutral-400" strokeWidth={1} />
      </div>
      <input
        onChange={(e) => {
          debounce(e.target.value);
          setValue(e.target.value);
        }}
        value={value}
        className="border border-border p-2 rounded-md px-10 placeholder:text-neutral-400 w-full sm:text-sm focuse:border-none focus:ring-4 focus:border-neutral-500 focus:ring-neutral-200 transition-all"
        placeholder="search..."
        ref={inputRef}
      />
    </div>
  );
}

export function SearchBoxPersisted({
  urlParam = "search",
}: {
  urlParam?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get(urlParam) ?? "");
  const [debouncedValue, setDebouncedValue] = useState("");
  //change url param when debounced value changes
  useEffect(() => {
    if (searchParams.get(urlParam) ?? "" !== debouncedValue) {
      debouncedValue === ""
        ? setSearchParams({})
        : setSearchParams({ search: debouncedValue });
    }
  }, [debouncedValue]);

  //sync url and input
  useEffect(() => {
    const search = searchParams.get(urlParam);
    if (
      (searchParams.get(urlParam) ?? "" !== value) &&
      value === debouncedValue
    ) {
      setValue(search ?? "");
    }
    //only change if
  }, [searchParams.get(urlParam)]);

  return (
    <SearchBox
      onChangeDebounced={setDebouncedValue}
      value={value}
      setValue={setValue}
    />
  );
}
