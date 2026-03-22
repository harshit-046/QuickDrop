import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getImageKit } from "@/lib/imagekit";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        {
          status: 401,
        },
      );
    }

    const authParams = getImageKit().getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error("Failed to generate ImageKit auth parameters", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate ImageKit authentication parameters.",
      },
      {
        status: 500,
      },
    );
  }
}
