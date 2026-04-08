import { api } from "@/utils/api";
import type { changePreferencesSchema } from "@shiva200701/todotypes";
import { z } from "zod";

export type UserPreference = z.infer<typeof changePreferencesSchema>;

export async function getCurrentUser() {
  const res = await api.get("/v1/user/profile");
  return res.data.user;
}

export async function saveUserProfile(formData: globalThis.FormData) {
  await api.post("/v1/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getUserPreference(): Promise<UserPreference> {
  const res = await api.get("/v1/user/user-preferences");
  return res.data;
}
