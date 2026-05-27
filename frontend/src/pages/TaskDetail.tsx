import { useNavigate, useLocation } from "react-router-dom";
import { useTodos } from "@/hooks/use-todos";
import { extractIdFromSlug } from "@/utils/functions/slug";
import { TodoDetailModal } from "@/components/modals/TodoDetailModal";
import { useMemo } from "react";
import type { TodoWithCompleteAtDateTime } from "@/types";

export default function TaskDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    backgroundLocation?: Location;
  } | null;

  const slug = location.pathname.split("/app/task/")[1] ?? "";
  const todoId = extractIdFromSlug(slug);

  const { data: todos } = useTodos();

  const todo = useMemo(() => {
    if (!todos || !todoId) return undefined;
    for (const t of todos) {
      if (t.id === todoId) return t;
      const child = t.children?.find((c) => c.id === todoId);
      if (child)
        return { ...child, children: undefined } as TodoWithCompleteAtDateTime;
    }
    return undefined;
  }, [todos, todoId]);

  if (!todo) return null;

  return (
    <TodoDetailModal
      show={true}
      setShow={(val) => {
        if (!val) {
          if (state?.backgroundLocation) {
            navigate(-1);
          } else {
            navigate("/app/today");
          }
        }
      }}
      todo={todo}
    />
  );
}
