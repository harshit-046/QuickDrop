import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function POST(request: NextRequest) {
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
        // parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const formUserId = formData.get("userId") as string;
        const parentId = formData.get("parentId") as string || null;

        if (userId !== formUserId) {
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

        if (!files) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File does not exist"
                },
                {
                    status: 401
                }
            )
        }

        if (parentId) {
            const [parentFolder] = await db.select().from(files).where(
                and(
                    eq(files.id, parentId),
                    eq(files.userId, userId),
                    eq(files.isFolder, true)
                )
            )
        }

        if (!parentId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Parent folder not exits"
                },
                {
                    status: 401
                }
            )
        }

        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            return NextResponse.json(
                {
                    message: "only image and pdf are supported",
                    success: "false"
                },
                {
                    status: 401
                }
            )
        }
        const folderPath = parentId ? `/quickdrop/${userId}/folder/${parentId}` : `/quickdrop/${userId}`;

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        const originalFilename = file.name;
        const fileExtension = originalFilename.split(".").pop() || "";
        // check for emapty extension
        // validation for not storing exw, php
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;

        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFileName,
            folder: folderPath,
            useUniqueFileName: false
        })

        const fileData = {
            id: uuidv4(),
            name: uploadResponse.name.trim(),
            path: uploadResponse.filePath,
            size: uploadResponse.size,
            type: uploadResponse.fileType,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId: userId,
            parentId:  parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false,
        }

        const [newFile] = await db.insert(files).values(fileData).returning();

        return NextResponse.json(
            {
                sucess: true,
                message: "File uploaded successfully",
                newFile
            },
            {
                status: 200
            }
        )

    } catch (error) {
        return NextResponse.json(
            {
                sucess: false,
                message: "Failed to upload file",
            },
            {
                status: 500
            }
        )
    }
}