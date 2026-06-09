import type { User } from "@/types";
import { api } from "@/utils/functions/api";
import type { changePreferencesSchema } from "@shiva200701/todotypes";
import { z } from "zod";

export type UserPreference = z.infer<typeof changePreferencesSchema>;

export async function getCurrentUser() {
  const { user }: { user: User } = (await api.get("/api/v1/user/profile")).data;
  return user;
}

export async function saveUserProfile(formData: globalThis.FormData) {
  await api.post("/api/v1/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function logout() {
  await api.post("/api/v1/user/logout");
}

export async function getUserPreference(): Promise<UserPreference> {
  const res = await api.get("/api/v1/user/user-preferences");
  return res.data;
}
