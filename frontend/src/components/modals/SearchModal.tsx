import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Command } from "cmdk";
import { Kbd } from "../ui/kbd";
import { useDebounce } from "use-debounce";
import { useSearchTodos } from "@/hooks/use-todos";
import AnimatedSizeContainer from "../ui/animated-size-container";
import ScrollContainer from "../ui/scroll-container";
import { cn } from "@/lib/utils";
import type { TodoSearchDocument } from "@shiva200701/todotypes";
import { SpinnerCustom } from "../ui/spinner";

function SearchModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue] = useDebounce(searchValue, 300);

  const { data: searchResults, isLoading: loading } =
    useSearchTodos(debouncedValue);

  console.log(searchResults);

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <AnimatedSizeContainer height>
        <Command shouldFilter={false}>
          <div className="relative flex items-center">
            <Command.Input
              className=" pl-4 py-3 focus:outline-none text-sm"
              placeholder="search todos"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <Kbd className="absolute right-2 w-fit">⌘K</Kbd>
          </div>
          <ScrollContainer className="max-h-[300px]">
            {loading ? (
              <Command.Loading>
                <div className="h-12 flex items-center justify-center">
                  <SpinnerCustom />
                </div>
              </Command.Loading>
            ) : (
              searchResults &&
              searchResults.length > 0 && (
                <Command.List className="p-1">
                  {searchResults.map((result) => (
                    <Option option={result} key={result.id} />
                  ))}
                </Command.List>
              )
            )}
          </ScrollContainer>
        </Command>
      </AnimatedSizeContainer>
    </Modal>
  );
}

function Option({ option }: { option: TodoSearchDocument }) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-3 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center justify-between",
        "data-[selected=true]:bg-accent "
      )}
      value={option.id}
      // onSelect={}
    >
      <div className="flex gap-4 items-center">
        <div className="flex gap-4 items-center justify-between">
          <span>{option.title}</span>
        </div>
      </div>
    </Command.Item>
  );
}

export function useSearchModal() {
  const [show, setShow] = useState(false);

  const searchModalCallback = useCallback(() => {
    return <SearchModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      setShowSearchModal: setShow,
      SearchModal: searchModalCallback,
    }),
    [searchModalCallback, setShow]
  );
}

export default SearchModal;
