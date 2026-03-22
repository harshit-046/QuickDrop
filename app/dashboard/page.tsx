import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import FileManager from "@/components/dashboard/FileManager";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <FileManager />;
}
