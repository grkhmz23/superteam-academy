export interface CmsFieldSchema {
  name: string;
  type: string;
  title: string;
  required?: boolean;
  description?: string;
}

export interface CmsDocumentSchema {
  name: string;
  title: string;
  type: "document";
  fields: CmsFieldSchema[];
}

export const courseSchema: CmsDocumentSchema = {
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Title", required: true },
    { name: "slug", type: "slug", title: "Slug", required: true },
    { name: "description", type: "text", title: "Description", required: true },
    { name: "difficulty", type: "string", title: "Difficulty", required: true },
    { name: "duration", type: "string", title: "Duration", required: true },
    { name: "totalXP", type: "number", title: "Total XP", required: true },
    { name: "thumbnailUrl", type: "url", title: "Thumbnail URL" },
    { name: "tags", type: "array:string", title: "Tags" },
    {
      name: "modules",
      type: "array:reference(module)",
      title: "Modules",
      required: true,
    },
  ],
};

export const moduleSchema: CmsDocumentSchema = {
  name: "module",
  title: "Module",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Title", required: true },
    { name: "description", type: "text", title: "Description" },
    { name: "order", type: "number", title: "Order", required: true },
    {
      name: "lessons",
      type: "array:reference(lesson)",
      title: "Lessons",
      required: true,
    },
  ],
};

export const lessonSchema: CmsDocumentSchema = {
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Title", required: true },
    { name: "slug", type: "string", title: "Slug", required: true },
    { name: "type", type: "string", title: "Type", required: true },
    { name: "content", type: "text", title: "Content", required: true },
    { name: "xpReward", type: "number", title: "XP Reward", required: true },
    { name: "duration", type: "string", title: "Duration", required: true },
    { name: "order", type: "number", title: "Order", required: true },
    { name: "moduleId", type: "string", title: "Module ID", required: true },
  ],
};

export const challengeSchema: CmsDocumentSchema = {
  name: "challenge",
  title: "Challenge",
  type: "document",
  fields: [
    { name: "lesson", type: "reference(lesson)", title: "Lesson", required: true },
    { name: "starterCode", type: "text", title: "Starter Code", required: true },
    { name: "language", type: "string", title: "Language", required: true },
    { name: "testCases", type: "array", title: "Test Cases" },
    { name: "hints", type: "array:string", title: "Hints" },
    { name: "solution", type: "text", title: "Solution" },
  ],
};

export const cmsSchemas: CmsDocumentSchema[] = [
  courseSchema,
  moduleSchema,
  lessonSchema,
  challengeSchema,
];
