import { Meilisearch, type Index } from "meilisearch";
import type { TodoSearchDocument } from "@shiva200701/todotypes";

class MeilisearchService {
  private client: Meilisearch;
  private todosIndex: Index<TodoSearchDocument>;

  constructor() {
    this.client = new Meilisearch({
      host: process.env.MEILISEARCH_URL!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
    });

    this.todosIndex = this.client.index("todos");
    this.configureIndex();
  }

  private async configureIndex() {
    try {
      await this.client.createIndex("todos", { primaryKey: "id" });
    } catch {
      // Index already exists
    }
    this.todosIndex.updateSettings;

    await this.todosIndex.updateSettings({
      searchableAttributes: ["title", "description", "tagNames"],
      filterableAttributes: ["userId", "completed", "priority", "parentId"],
      sortableAttributes: ["createdAt", "dueDate"],
    });
  }

  async upsertTodo(
    todo: {
      id: string;
      title: string;
      description: string | null;
      userId: string;
      completed: boolean;
      priority: string | null;
      parentId: string | null;
      dueDate: string | null;
      createdAt: Date;
    },
    tagNames: string[]
  ) {
    const document: TodoSearchDocument = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      tagNames,
      userId: todo.userId,
      completed: todo.completed,
      priority: todo.priority,
      parentId: todo.parentId,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt.toISOString(),
    };

    await this.todosIndex.addDocuments([document]);
  }

  async deleteTodo(todoId: string) {
    await this.todosIndex.deleteDocument(todoId);
  }

  async deleteTodos(todoIds: string[]) {
    await this.todosIndex.deleteDocuments(todoIds);
  }

  async search(userId: string, query: string) {
    const results = await this.todosIndex.search(query, {
      filter: `userId = "${userId}"`,
      limit: 20,
    });
    return results.hits;
  }

  async bulkUpsert(documents: TodoSearchDocument[]) {
    await this.todosIndex.addDocuments(documents);
  }
}

const searchService = new MeilisearchService();

export default searchService;
