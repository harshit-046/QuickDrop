import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { buildUploadFileName, getFolderById } from "@/lib/files";
import { getImageKit } from "@/lib/imagekit";
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

    const formData = await request.formData();
    const requestedParentId = formData.get("parentId");
    const parentId = typeof requestedParentId === "string" && requestedParentId ? requestedParentId : null;
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

    const entries = formData.getAll("files");
    const filesToUpload = entries.length > 0 ? entries : [formData.get("file")];
    const uploadableFiles = filesToUpload.filter((entry): entry is File => entry instanceof File);

    if (uploadableFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Select at least one file to upload.",
        },
        {
          status: 400,
        },
      );
    }

    const imagekit = getImageKit();
    const uploadedRecords = [];

    for (const file of uploadableFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const uploadResponse = await imagekit.upload({
        file: Buffer.from(arrayBuffer),
        fileName: buildUploadFileName(file.name),
        folder: parentFolder?.path ?? `/quickdrop/${userId}`,
        useUniqueFileName: false,
      });

      uploadedRecords.push({
        id: uuidv4(),
        name: file.name,
        path: uploadResponse.filePath,
        size: uploadResponse.size,
        type: file.type || "application/octet-stream",
        fileUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl || null,
        storageId: uploadResponse.fileId,
        userId,
        parentId: parentFolder?.id ?? null,
        isFolder: false,
        isStarred: false,
        isTrash: false,
      });
    }

    const createdFiles = await db.insert(files).values(uploadedRecords).returning();

    return NextResponse.json(
      {
        success: true,
        message: `${createdFiles.length} file${createdFiles.length > 1 ? "s" : ""} uploaded successfully.`,
        files: createdFiles,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to upload files", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file.",
      },
      {
        status: 500,
      },
    );
  }
}
