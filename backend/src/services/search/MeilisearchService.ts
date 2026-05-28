import { Meilisearch, type Index } from "meilisearch";
import type {
  TodoSearchDocument,
  TagSearchDocument,
} from "@shiva200701/todotypes";
import prisma from "../../db/index.js";

class MeilisearchService {
  private client: Meilisearch;
  private todosIndex: Index<TodoSearchDocument>;
  private tagsIndex: Index<TagSearchDocument>;

  constructor() {
    this.client = new Meilisearch({
      host: process.env.MEILISEARCH_URL!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
    });

    this.todosIndex = this.client.index("todos");
    this.tagsIndex = this.client.index("tags");
    this.configureIndexes();
  }

  private async configureIndexes() {
    try {
      await this.client.createIndex("todos", { primaryKey: "id" });
    } catch {
      // Index already exists
    }

    try {
      await this.client.createIndex("tags", { primaryKey: "id" });
    } catch {
      // Index already exists
    }

    await this.todosIndex.updateSettings({
      searchableAttributes: ["title", "description"],
      filterableAttributes: ["userId", "completed", "priority", "parentId"],
      sortableAttributes: ["createdAt", "dueDate"],
    });

    await this.tagsIndex.updateSettings({
      searchableAttributes: ["name"],
      filterableAttributes: ["userId"],
    });
  }

  async upsertTodo(todo: {
    id: string;
    title: string;
    description: string | null;
    userId: string;
    completed: boolean;
    priority: string | null;
    parentId: string | null;
    dueDate: string | null;
    createdAt: Date;
  }) {
    const document: TodoSearchDocument = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
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
    const [todoResults, tagResults] = await Promise.all([
      this.todosIndex.search(query, {
        filter: `userId = "${userId}"`,
        limit: 20,
      }),
      this.tagsIndex.search(query, {
        filter: `userId = "${userId}"`,
        limit: 10,
      }),
    ]);

    return {
      todos: todoResults.hits,
      tags: tagResults.hits,
    };
  }

  async bulkUpsert(documents: TodoSearchDocument[]) {
    await this.todosIndex.addDocuments(documents);
  }

  // Tag methods
  async upsertTag(tag: TagSearchDocument) {
    await this.tagsIndex.addDocuments([tag]);
  }

  async deleteTag(tagId: string) {
    await this.tagsIndex.deleteDocument(tagId);
  }

  async deleteTags(tagIds: string[]) {
    await this.tagsIndex.deleteDocuments(tagIds);
  }

  async bulkUpsertTags(documents: TagSearchDocument[]) {
    await this.tagsIndex.addDocuments(documents);
  }

  async reindexUser(userId: string) {
    const [todos, tags] = await Promise.all([
      prisma.todo.findMany({ where: { userId } }),
      prisma.tag.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
      }),
    ]);

    const todoDocuments: TodoSearchDocument[] = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      userId: todo.userId,
      completed: todo.completed,
      priority: todo.priority,
      parentId: todo.parentId,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt.toISOString(),
    }));

    const tagDocuments: TagSearchDocument[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId,
    }));

    await Promise.all([
      this.bulkUpsert(todoDocuments),
      this.bulkUpsertTags(tagDocuments),
    ]);

    return { todosCount: todoDocuments.length, tagsCount: tagDocuments.length };
  }
}

const searchService = new MeilisearchService();

export default searchService;
