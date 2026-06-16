import api from "@/utils/functions/api";
import { type ParsedTask } from "@shiva200701/todotypes";

export async function aiParseTask({ input }: { input: string }) {
  try {
    const { data } = await api.post("/api/v2/ai/parse-task", {
      text: input,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return data.response as ParsedTask;
  } catch (error) {
    throw error;
  }
}
