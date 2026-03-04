import { put } from "@vercel/blob";

const MAX_PROJECT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadProjectImage(file: File, userId: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type");
  }

  if (file.size > MAX_PROJECT_IMAGE_BYTES) {
    throw new Error("Image exceeds max size");
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const filename = sanitizeFilename(file.name || `upload.${ext}`);
  const pathname = `projects/${userId}/${Date.now()}-${filename}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: file.type,
    size: file.size,
  };
}
