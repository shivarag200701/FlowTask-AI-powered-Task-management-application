import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type TagSelectionContext = {
  isSelectMode: boolean;
  setIsSelectMode: Dispatch<SetStateAction<boolean>>;
  selectedTags: string[] | null;
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
};

const tagSelectionContext = createContext<TagSelectionContext>({
  isSelectMode: false,
  setIsSelectMode: () => {},
  selectedTags: null,
  setSelectedTags: () => {},
});

export const TagSelectionProvider = ({ children }: PropsWithChildren) => {
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  return (
    <tagSelectionContext.Provider
      value={{ isSelectMode, setIsSelectMode, selectedTags, setSelectedTags }}
    >
      {children}
    </tagSelectionContext.Provider>
  );
};

export function useTagSelectionContext() {
  const context = useContext(tagSelectionContext);

  if (context === undefined) {
    throw new Error(
      "useRegisterContext must be used within a RegisterProvider",
    );
  }
  return context;
}
