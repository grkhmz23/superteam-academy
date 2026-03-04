import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { Errors, handleApiError } from "@/lib/api/errors";
import { uploadProjectImage } from "@/lib/storage/project-images";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized("Unauthorized");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw Errors.validation("Missing file", { file: ["File is required"] });
    }

    const uploaded = await uploadProjectImage(file, session.user.id);

    return NextResponse.json({ image: uploaded }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unsupported image type") {
        return handleApiError(
          Errors.validation("Invalid image type", { file: ["Only image uploads are allowed"] })
        );
      }
      if (error.message === "Image exceeds max size") {
        return handleApiError(
          Errors.validation("Image too large", { file: ["Max image size is 5 MB"] })
        );
      }
    }
    return handleApiError(error);
  }
}
