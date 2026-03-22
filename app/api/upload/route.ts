import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { getFolderById } from "@/lib/files";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();
    const upload = body.imagekit ?? body.upload;
    const parentId = typeof body.parentId === "string" && body.parentId ? body.parentId : null;
    const parentFolder = parentId ? await getFolderById(userId, parentId) : null;

    if (parentId && !parentFolder) {
      return NextResponse.json(
        {
          success: false,
          message: "Parent folder was not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!upload || !upload.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload payload.",
        },
        {
          status: 400,
        },
      );
    }

    const [file] = await db
      .insert(files)
      .values({
        id: uuidv4(),
        name: upload.name || "Untitled",
        path: upload.filePath || `${parentFolder?.path ?? `/quickdrop/${userId}`}/${upload.name || "file"}`,
        size: upload.size || 0,
        type: upload.type || upload.fileType || "application/octet-stream",
        fileUrl: upload.url,
        thumbnailUrl: upload.thumbnailUrl || null,
        storageId: upload.fileId || null,
        userId,
        parentId: parentFolder?.id ?? null,
        isFolder: false,
        isStarred: false,
        isTrash: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "File metadata saved successfully.",
      file,
    });
  } catch (error) {
    console.error("Failed to save upload metadata", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save upload metadata.",
      },
      {
        status: 500,
      },
    );
  }
}
