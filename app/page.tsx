import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderTree, ShieldCheck, Sparkles, Star, UploadCloud } from "lucide-react";

const featureCards = [
  {
    title: "Structured folders",
    description: "Organize assets in nested spaces that stay easy to browse and revisit.",
    icon: FolderTree,
  },
  {
    title: "Fast uploads",
    description: "Send files straight to cloud storage and keep metadata synced in your workspace.",
    icon: UploadCloud,
  },
  {
    title: "Star and recover",
    description: "Keep important work one click away and restore anything you moved to trash.",
    icon: Star,
  },
  {
    title: "Protected by Clerk",
    description: "Every dashboard view and file action is gated behind authenticated sessions.",
    icon: ShieldCheck,
  },
];

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell overflow-hidden px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="animate-rise glass-panel flex items-center justify-between rounded-full px-5 py-3">
          <div>
            <p className="section-title">QuickDrop</p>
            <p className="text-sm text-muted">Personal cloud workspace</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--ink-soft)]"
            >
              Create account
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
          <div className="animate-rise space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 px-3 py-1 text-sm text-ink-soft">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              File management without the clutter
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-6xl">
                Keep your files in one <span className="gradient-text">sharp, searchable</span> workspace.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                QuickDrop gives you nested folders, cloud uploads, starred items, and trash recovery in a single dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="accent-ring inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-medium text-white transition hover:translate-y-[-1px]"
              >
                Launch your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/70 px-6 py-3 font-medium"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="animate-rise soft-panel rounded-[2rem] p-6 md:p-8">
            <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#263248_0%,#111827_100%)] p-6 text-white">
              <p className="section-title text-white/60">Workspace preview</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-sm text-white/60">Focus collection</p>
                  <p className="mt-2 text-2xl font-semibold">Brand assets</p>
                  <p className="mt-1 text-sm text-white/70">24 files · 4 folders · 1.8 GB</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-white/60">Starred</p>
                    <p className="mt-2 text-xl font-semibold">7 priority items</p>
                  </div>
                  <div className="rounded-3xl bg-[rgba(217,119,6,0.24)] p-4">
                    <p className="text-sm text-white/70">Trash safety</p>
                    <p className="mt-2 text-xl font-semibold">Restore in seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(({ title, description, icon: Icon }, index) => (
            <article
              key={title}
              className="animate-rise soft-panel rounded-[1.6rem] p-5"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
