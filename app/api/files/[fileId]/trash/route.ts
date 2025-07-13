import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorize"
                },
                {
                    status: 401
                }
            )
        }

        const fileId = (await params).fileId;
        if (!fileId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File Id not provided"
                },
                {
                    status: 500
                }
            )
        }

        const [file] = await db.select().from(files).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        )

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File not found in database"
                },
                {
                    status: 401
                }
            )
        }

        const updatedFiles = await db.update(files).set({ isTrash: !files.isTrash }).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning();

        console.log("UPDATED FILE :", updatedFiles);

        const updatedFile = updatedFiles[0];

        return NextResponse.json(
            {
                message: "File trashed",
                success: true,
                updatedFile
            },
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to trashed",
                success: false,
            },
            {
                status: 401
            }
        )
    }

}