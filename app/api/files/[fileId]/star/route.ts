import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
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
    const [file] = await db.select().from(files).where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
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

    const [updatedFile] = await db
      .update(files)
      .set({
        isStarred: !file.isStarred,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: updatedFile.isStarred ? "Item added to starred." : "Item removed from starred.",
        item: updatedFile,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to update starred state", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update starred state.",
      },
      {
        status: 500,
      },
    );
  }
}
