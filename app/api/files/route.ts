import { buildDashboardData, normalizeDashboardView } from "@/lib/files";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const view = normalizeDashboardView(searchParams.get("view"));
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search") ?? "";

    const data = await buildDashboardData(userId, view, view === "all" ? parentId : null, search);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch files", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch files.",
      },
      {
        status: 500,
      },
    );
  }
}
