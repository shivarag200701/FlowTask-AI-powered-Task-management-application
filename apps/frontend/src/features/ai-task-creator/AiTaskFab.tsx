import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "../../components/ui/modal";
import { useParseTask } from "@/hooks/use-ai";
import type { ParsedTask } from "@shiva200701/todotypes";
import AiParseInput from "./AiParseInput";
import ParsedTaskPreview from "./ParsedTaskPreview";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateTodo } from "@/hooks/use-todos";

function AiTaskFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTask | null>(null);

  const { mutateAsync: parseText, isPending } = useParseTask();
  const { mutateAsync: createTodo, isPending: isCreatingTodo } =
    useCreateTodo();

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const result = await parseText({ input });
    setParsed(result);
  };

  const handleConfirm = async () => {
    if (parsed) {
      await createTodo({
        ...parsed,
        tags: parsed.tags.map((tag) => tag.id),
      });
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setInput("");
    setParsed(null);
    setIsOpen(false);
  };

  useHotkeys("mod+i", () => {
    setIsOpen(!isOpen);
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-20",
          "flex items-center justify-center",
          "size-12 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 hover:shadow-xl hover:scale-105",
          "active:scale-95",
          "transition-all duration-200",
          "md:bottom-8 md:right-8"
        )}
      >
        <Sparkles className="size-5" />
      </button>

      <Modal
        showModal={isOpen}
        setShowModal={setIsOpen}
        onClose={handleDismiss}
        className="max-w-lg"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">AI Task Creator</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <AiParseInput
                  input={input}
                  setInput={setInput}
                  isPending={isPending}
                  parsed={parsed}
                  onParse={handleSubmit}
                  onConfirm={handleConfirm}
                  onDismiss={handleDismiss}
                  onClearParsed={() => setParsed(null)}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl" side="top" sideOffset={8}>
              Use <span className="font-semibold">#</span> to specify tags
            </TooltipContent>
          </Tooltip>
          {parsed && (
            <ParsedTaskPreview
              parsed={parsed}
              onConfirm={handleConfirm}
              onRetype={() => setParsed(null)}
              isCreating={isCreatingTodo}
            />
          )}

          {!parsed && !isPending && (
            <p className="text-xs text-muted-foreground/70 text-center">
              Describe your task naturally — AI will extract the title, date,
              priority, and tags.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default AiTaskFab;
