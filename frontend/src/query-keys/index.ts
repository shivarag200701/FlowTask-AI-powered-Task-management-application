//exploe about uniqueness of keys whether having old keys affects things
//check whether we need different query keys for different preferences
export const authQueryKeys = {
  users: ["users"] as const,
};

export const todosQueryKeys = {
  all: ["todos"] as const,
};

export const onboardingQueryKeys = {
  progress: ["onboardingProgress"] as const,
};

export const userPreferenceKeys = {
  preferences: ["user", "preferences"] as const,
};
