import { createContext, useContext, type PropsWithChildren } from "react";

type ProjectContext = {
  projectId: string | null;
};

const projectContext = createContext<ProjectContext>({
  projectId: null,
});

export function ProjectProvider({
  id,
  children,
}: PropsWithChildren & { id: string }) {
  return (
    <projectContext.Provider value={{ projectId: id }}>
      {children}
    </projectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(projectContext);

  if (context === null) {
    throw new Error("projectContext must be used within a ProjectProvider");
  }
  return context;
}
