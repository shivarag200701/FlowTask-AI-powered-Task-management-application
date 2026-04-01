import { api } from "@/utils/api";

export async function getCurrentUser() {
  const res = await api.get("/v1/user/profile");
  return res.data.user;
}
