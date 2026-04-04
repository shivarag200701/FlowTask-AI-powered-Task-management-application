import type { ViewMode } from "@/types";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type TaskDisplayContext = {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
};

const taskDisplayContext = createContext<TaskDisplayContext>({
  viewMode: "list",
  setViewMode: () => {},
});

function TaskDisplayProvider({ children }: PropsWithChildren) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <taskDisplayContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </taskDisplayContext.Provider>
  );
}

function useTaskDisplayContext() {
  const context = useContext(taskDisplayContext);

  if (context === undefined) {
    throw new Error(
      "useRegisterContext must be used within a RegisterProvider",
    );
  }
  return context;
}

export { TaskDisplayProvider, useTaskDisplayContext };
