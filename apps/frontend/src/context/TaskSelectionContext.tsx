import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type TaskSelectionContext = {
  isSelectMode: boolean;
  setIsSelectMode: Dispatch<SetStateAction<boolean>>;
  selectedTaskIds: string[];
  setSelectedTaskIds: Dispatch<SetStateAction<string[]>>;
};

const taskSelectionContext = createContext<TaskSelectionContext>({
  isSelectMode: false,
  setIsSelectMode: () => {},
  selectedTaskIds: [],
  setSelectedTaskIds: () => {},
});

export function TaskSelectionProvider({ children }: PropsWithChildren) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  return (
    <taskSelectionContext.Provider
      value={{
        isSelectMode,
        setIsSelectMode,
        selectedTaskIds,
        setSelectedTaskIds,
      }}
    >
      {children}
    </taskSelectionContext.Provider>
  );
}

export function useTaskSelectionContext() {
  const context = useContext(taskSelectionContext);

  if (context === null) {
    throw new Error(
      "taskSelectionContext must be used within a TaskSelectionProvider"
    );
  }
  return context;
}
