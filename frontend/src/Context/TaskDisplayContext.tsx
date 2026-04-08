import { getUserPreference } from "@/api/user";
import { userPreferenceKeys } from "@/query-keys";
import type { ViewMode } from "@/types";
import { useQuery } from "@tanstack/react-query";
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
  isDirty: boolean;
  persisted: ViewMode;
};

const taskDisplayContext = createContext<TaskDisplayContext>({
  viewMode: "list",
  setViewMode: () => {},
  isDirty: false,
  persisted: "list",
});

function TaskDisplayProvider({ children }: PropsWithChildren) {
  const { data: preference } = useQuery({
    queryKey: userPreferenceKeys.preferences,
    queryFn: getUserPreference,
    staleTime: 60000,
  });

  const persisted = preference?.taskDisplayPreferences?.viewMode ?? "list";

  const [viewMode, setViewMode] = useState<ViewMode>(
    () => preference?.taskDisplayPreferences?.viewMode ?? "list",
  );

  console.log("view mode", viewMode);
  console.log("persisted", persisted);

  const isDirty = persisted !== viewMode;

  return (
    <taskDisplayContext.Provider
      value={{ viewMode, setViewMode, isDirty, persisted }}
    >
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
