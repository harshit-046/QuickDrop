import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { collectDescendantIds, getUserItems } from "@/lib/files";
import { getImageKit } from "@/lib/imagekit";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
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

    const { fileId } = await params;
    const items = await getUserItems(userId);
    const target = items.find((item) => item.id === fileId);

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          message: "Item not found.",
        },
        {
          status: 404,
        },
      );
    }

    const ids = target.isFolder ? collectDescendantIds(items, fileId) : [fileId];
    const deletedItems = await db
      .delete(files)
      .where(and(eq(files.userId, userId), inArray(files.id, ids)))
      .returning();

    try {
      const imagekit = getImageKit();
      const storageIds = deletedItems
        .filter((item) => !item.isFolder && item.storageId)
        .map((item) => item.storageId as string);

      await Promise.allSettled(storageIds.map((storageId) => imagekit.deleteFile(storageId)));
    } catch (error) {
      console.error("ImageKit cleanup failed", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item deleted permanently.",
        deletedCount: deletedItems.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to permanently delete item", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete item permanently.",
      },
      {
        status: 500,
      },
    );
  }
}
