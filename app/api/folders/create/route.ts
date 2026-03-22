import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { buildFolderPath, getFolderById } from "@/lib/files";
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const parentId = typeof body.parentId === "string" && body.parentId ? body.parentId : null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder name is required.",
        },
        {
          status: 400,
        },
      );
    }

    const parentFolder = parentId ? await getFolderById(userId, parentId) : null;

    if (parentId && (!parentFolder || parentFolder.isTrash)) {
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

    const folderId = uuidv4();
    const [folder] = await db
      .insert(files)
      .values({
        id: folderId,
        name,
        path: buildFolderPath(userId, name, parentFolder?.path ?? null),
        size: 0,
        type: "folder",
        fileUrl: "",
        thumbnailUrl: null,
        storageId: null,
        userId,
        parentId: parentFolder?.id ?? null,
        isFolder: true,
        isStarred: false,
        isTrash: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Folder created successfully.",
      folder,
    });
  } catch (error) {
    console.error("Failed to create folder", error);

    return NextResponse.json(
      {
        success: false,
        message: "Folder could not be created.",
      },
      {
        status: 500,
      },
    );
  }
}
