//exploe about uniqueness of keys whether having old keys affects things

import type { TagsQuery, TodosQuery } from "@/types";

//check whether we need different query keys for different preferences
export const authQueryKeys = {
  users: ["users"] as const,
};

export const todosQueryKeys = {
  all: ["todos"] as const,
  filtered: ({ tagIds }: TodosQuery) => ["todos", "filtered", tagIds] as const,
  search: (q: string) => ["todos", "search", q] as const,
  completed: (params?: Record<string, string>) =>
    ["todos", "completed", params] as const,
};

export const onboardingQueryKeys = {
  progress: ["onboardingProgress"] as const,
};

export const userPreferenceKeys = {
  preferences: ["user", "preferences"] as const,
};

export const tagsQueryKeys = {
  all: ["tags"] as const,
  filtered: ({ search }: TagsQuery) => ["tags", "filtered", search] as const,
  count: ["tagCount"] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  personal: (search: string) => ["projects", "personal", search] as const,
  workspace: (workspaceId: string) =>
    ["projects", "workspace", workspaceId] as const,
  sections: (projectId: string) => ["projects", projectId, "sections"] as const,
};
