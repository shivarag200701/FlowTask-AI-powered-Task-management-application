import z from "zod";
export declare const CreateTodoSchema: any;
export declare const todoQuerySchema: any;
export declare const UpdateTodoSchema: any;
export declare const TodoBulkDeleteSchema: any;
export declare const TodoSearchDocumentSchema: any;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
export type TodoSearchDocument = z.infer<typeof TodoSearchDocumentSchema>;
//# sourceMappingURL=todo.d.ts.map