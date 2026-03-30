import { useEffect, useState } from "react";
import type { ParsedDateResult } from "../types";
import { parseNaturalLanguageDate } from "@/utils/nlpDateParser";

function useNLPDate(delayMs: number) {
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedDateResult | null>(
    null,
  );

  useEffect(() => {
    if (!nlpInput.trim()) {
      setParsedResult(null);
      return;
    }

    const id = setTimeout(() => {
      setParsedResult(parseNaturalLanguageDate(nlpInput));
    }, delayMs);

    return () => {
      clearTimeout(id);
    };
  }, [nlpInput]);

  return {
    nlpInput,
    setNlpInput,
    parsedResult,
  };
}
export default useNLPDate;
