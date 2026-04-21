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
export declare const GetTagsQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    ids: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>, z.ZodTransform<string[], string | string[]>>>;
}, z.core.$strip>;
//# sourceMappingURL=tag.d.ts.map