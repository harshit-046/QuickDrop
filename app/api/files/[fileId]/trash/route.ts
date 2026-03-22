import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { collectDescendantIds, getUserItems } from "@/lib/files";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function PATCH(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
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

    const nextTrashState = !target.isTrash;
    const ids = target.isFolder ? collectDescendantIds(items, fileId) : [fileId];
    const updatedItems = await db
      .update(files)
      .set({
        isTrash: nextTrashState,
        updatedAt: new Date(),
      })
      .where(and(eq(files.userId, userId), inArray(files.id, ids)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: nextTrashState ? "Item moved to trash." : "Item restored.",
        items: updatedItems,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to update trash state", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update trash state.",
      },
      {
        status: 500,
      },
    );
  }
}
