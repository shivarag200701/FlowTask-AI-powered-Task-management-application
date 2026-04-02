import { api } from "@/utils/api";

export async function getCurrentUser() {
  const res = await api.get("/v1/user/profile");
  return res.data.user;
}

export async function saveUserProfile(formData: globalThis.FormData) {
  await api.post("/v1/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
