import { z } from "zod";
export declare const RESOURCE_COLORS_DATA: readonly [{
    readonly color: "red";
    readonly tagVariants: "bg-red-100 text-red-600";
}, {
    readonly color: "yellow";
    readonly tagVariants: "bg-yellow-100 text-yellow-600";
}, {
    readonly color: "green";
    readonly tagVariants: "bg-green-100 text-green-600";
}, {
    readonly color: "blue";
    readonly tagVariants: "bg-blue-100 text-blue-600";
}, {
    readonly color: "purple";
    readonly tagVariants: "bg-purple-100 text-purple-600";
}, {
    readonly color: "brown";
    readonly tagVariants: "bg-brown-100 text-brown-600";
}, {
    readonly color: "gray";
    readonly tagVariants: "bg-gray-100 text-gray-600";
}];
export declare const RESOURCE_COLORS: ("red" | "yellow" | "green" | "blue" | "purple" | "brown" | "gray")[];
export declare const TagColorSchema: z.ZodEnum<{
    red: "red";
    yellow: "yellow";
    green: "green";
    blue: "blue";
    purple: "purple";
    brown: "brown";
    gray: "gray";
}>;
export type ResourceColorsEnum = z.infer<typeof TagColorSchema>;
export declare const CreateTagSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodEnum<{
        red: "red";
        yellow: "yellow";
        green: "green";
        blue: "blue";
        purple: "purple";
        brown: "brown";
        gray: "gray";
    }>>;
}, z.core.$strip>;
export declare const UpdateTagSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        red: "red";
        yellow: "yellow";
        green: "green";
        blue: "blue";
        purple: "purple";
        brown: "brown";
        gray: "gray";
    }>>>;
}, z.core.$strip>;
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>;
    dueDate: z.ZodNullable<z.ZodString>;
    dueTime: z.ZodNullable<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reminder: z.ZodDefault<z.ZodBoolean>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateTodoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reminder: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isAllDay: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    prevIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextIndex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    sortKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
//# sourceMappingURL=v2.d.ts.map