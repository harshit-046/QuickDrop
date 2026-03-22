"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import type { DashboardData, DashboardView, FileItem } from "@/types/files";

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function isImageFile(item: FileItem) {
  return item.type.startsWith("image/");
}

function fileTypeLabel(item: FileItem) {
  if (item.isFolder) {
    return "Folder";
  }

  if (item.type === "application/pdf") {
    return "PDF";
  }

  if (item.type.startsWith("image/")) {
    return "Image";
  }

  const extension = item.name.split(".").pop();
  return extension ? extension.toUpperCase() : "File";
}

function viewLabel(view: DashboardView) {
  if (view === "starred") {
    return "Starred";
  }

  if (view === "trash") {
    return "Trash";
  }

  return "Workspace";
}

const navItems: Array<{ value: DashboardView; label: string }> = [
  { value: "all", label: "Workspace" },
  { value: "starred", label: "Starred" },
  { value: "trash", label: "Trash" },
];

const dashboardInputShellClassName =
  "flex min-h-12 items-center rounded-2xl border border-gray-200/80 bg-[rgba(255,250,240,0.94)] px-4 shadow-sm transition focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-300/70";

export default function FileManager() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasLoadedRef = useRef(false);

  const viewParam = searchParams.get("view");
  const folderId = searchParams.get("folder");
  const view: DashboardView = viewParam === "starred" || viewParam === "trash" ? viewParam : "all";

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderName, setFolderName] = useState("");
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const deferredSearch = useDeferredValue(searchTerm.trim());

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      if (!ignore) {
        if (hasLoadedRef.current) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
      }

      try {
        const params = new URLSearchParams();
        params.set("view", view);

        if (view === "all" && folderId) {
          params.set("parentId", folderId);
        }

        if (deferredSearch) {
          params.set("search", deferredSearch);
        }

        const response = await fetch(`/api/files?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load files.");
        }

        if (!ignore) {
          setData(payload);
          hasLoadedRef.current = true;
          setNotice((current) => (current?.type === "success" ? current : null));
        }
      } catch (error) {
        if (!ignore) {
          setNotice({
            type: "error",
            message: error instanceof Error ? error.message : "Failed to load files.",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, [deferredSearch, folderId, view]);

  function updateRoute(nextView: DashboardView, nextFolderId: string | null = null) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "all") {
      params.delete("view");
    } else {
      params.set("view", nextView);
    }

    if (nextView === "all" && nextFolderId) {
      params.set("folder", nextFolderId);
    } else {
      params.delete("folder");
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  async function refreshData(successMessage?: string) {
    setIsRefreshing(true);

    try {
      const params = new URLSearchParams();
      params.set("view", view);

      if (view === "all" && folderId) {
        params.set("parentId", folderId);
      }

      if (deferredSearch) {
        params.set("search", deferredSearch);
      }

      const response = await fetch(`/api/files?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to refresh files.");
      }

      setData(payload);
      if (successMessage) {
        setNotice({ type: "success", message: successMessage });
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to refresh files.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createFolder() {
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      setNotice({ type: "error", message: "Folder name is required." });
      return;
    }

    setIsCreatingFolder(true);

    try {
      const response = await fetch("/api/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          parentId: view === "all" ? folderId : null,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Folder could not be created.");
      }

      setFolderName("");
      setShowFolderForm(false);
      await refreshData("Folder created.");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Folder could not be created.",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      if (view === "all" && folderId) {
        formData.append("parentId", folderId);
      }

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Upload failed.");
      }

      await refreshData(selectedFiles.length > 1 ? "Files uploaded." : "File uploaded.");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function updateItem(path: string, method: "PATCH" | "DELETE", successMessage: string) {
    setActiveActionId(path);

    try {
      const response = await fetch(path, { method });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Action failed.");
      }

      await refreshData(successMessage);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Action failed.",
      });
    } finally {
      setActiveActionId(null);
    }
  }

  const stats = data?.stats;
  const items = data?.items ?? [];
  const currentFolder = data?.currentFolder;

  return (
    <main className="page-shell px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel animate-rise rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="space-y-1">
              <p className="section-title">QuickDrop</p>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="mt-6 rounded-[1.6rem] bg-[linear-gradient(145deg,#20283a_0%,#111827_100%)] p-5 text-white">
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm">Workspace summary</span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Stored files</p>
                <p className="mt-2 text-3xl font-semibold">{stats?.totalItems ?? 0}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Folders</p>
                  <p className="mt-2 text-xl font-semibold">{stats?.totalFolders ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-[rgba(217,119,6,0.25)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/65">Storage</p>
                  <p className="mt-2 text-xl font-semibold">{formatBytes(stats?.totalStorageBytes ?? 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const selected = item.value === view;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => updateRoute(item.value)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    selected ? "bg-[var(--foreground)] text-white" : "bg-white/60 text-[var(--foreground)] hover:bg-white"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.value === "starred" ? <Star className="h-4 w-4" /> : null}
                  {item.value === "trash" ? <Trash2 className="h-4 w-4" /> : null}
                  {item.value === "all" ? <Folder className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 space-y-3">
            <Button
              className="h-12 w-full rounded-full bg-[var(--accent)] text-sm font-medium text-white"
              onPress={() => fileInputRef.current?.click()}
              isLoading={isUploading}
            >
              <Upload className="h-4 w-4" />
              Upload files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />

            <Button
              className="h-12 w-full rounded-full border border-[var(--border)] bg-white/70 text-sm font-medium text-[var(--foreground)]"
              onPress={() => setShowFolderForm((value) => !value)}
              isDisabled={view !== "all"}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="soft-panel rounded-[1.4rem] p-4">
              <p className="text-sm text-muted">Starred items</p>
              <p className="mt-2 text-2xl font-semibold">{stats?.totalStarred ?? 0}</p>
            </div>
            <div className="soft-panel rounded-[1.4rem] p-4">
              <p className="text-sm text-muted">Trash queue</p>
              <p className="mt-2 text-2xl font-semibold">{stats?.totalTrash ?? 0}</p>
            </div>
          </div>
        </aside>

        <section className="animate-rise flex min-w-0 flex-col gap-4">
          <header className="glass-panel rounded-[2rem] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="section-title">{viewLabel(view)}</p>
                  <h2 className="mt-1 text-3xl font-semibold">
                    {view === "all" ? currentFolder?.name ?? "Root workspace" : `${viewLabel(view)} items`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  <button
                    type="button"
                    className="rounded-full bg-white/70 px-3 py-1 transition hover:bg-white"
                    onClick={() => updateRoute("all")}
                  >
                    Root
                  </button>
                  {data?.breadcrumbs.map((crumb) => (
                    <button
                      key={crumb.id}
                      type="button"
                      className="rounded-full bg-white/70 px-3 py-1 transition hover:bg-white"
                      onClick={() => updateRoute("all", crumb.id)}
                    >
                      {crumb.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className={`${dashboardInputShellClassName} min-w-[240px]`}>
                  <span className="mr-3 flex h-4 w-4 flex-shrink-0 items-center justify-center text-default-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search current view"
                    className="h-full min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-default-400"
                  />
                </label>
                <Button
                  className="h-12 rounded-full border border-[var(--border)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                  onPress={() => refreshData()}
                  isLoading={isRefreshing}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {showFolderForm ? (
              <div className="mt-5 rounded-[1.6rem] border border-[var(--border)] bg-white/60 p-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <label className={`${dashboardInputShellClassName} flex-1`}>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(event) => setFolderName(event.target.value)}
                      placeholder="Folder name"
                      className="h-full min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-default-400"
                    />
                  </label>
                  <div className="flex gap-3">
                    <Button
                      className="h-11 rounded-full bg-[var(--foreground)] px-5 text-sm font-medium text-white"
                      onPress={createFolder}
                      isLoading={isCreatingFolder}
                    >
                      Create
                    </Button>
                    <Button
                      className="h-11 rounded-full border border-[var(--border)] bg-white px-5 text-sm font-medium text-[var(--foreground)]"
                      onPress={() => {
                        setShowFolderForm(false);
                        setFolderName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {notice ? (
              <div
                className={`mt-5 rounded-[1.4rem] px-4 py-3 text-sm ${
                  notice.type === "error"
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {notice.message}
              </div>
            ) : null}
          </header>

          <section className="glass-panel flex-1 rounded-[2rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="section-title">Current view</p>
                <p className="mt-1 text-sm text-muted">
                  {view === "all" && currentFolder ? `Inside ${currentFolder.name}` : `Showing ${viewLabel(view).toLowerCase()}`}
                </p>
              </div>
              {isRefreshing ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Syncing
                </div>
              ) : null}
            </div>

            {isLoading && !data ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white/50">
                <div className="flex items-center gap-3 text-muted">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Loading workspace
                </div>
              </div>
            ) : null}

            {!isLoading && items.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  {view === "trash" ? <Trash2 className="h-6 w-6" /> : <Folder className="h-6 w-6" />}
                </div>
                <h3 className="text-2xl font-semibold">Nothing here yet</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                  {view === "trash"
                    ? "Move items to trash and they will appear here for restore or permanent deletion."
                    : "Upload files or create folders to start filling this workspace."}
                </p>
              </div>
            ) : null}

            {items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => {
                  const actionPathBase = `/api/files/${item.id}`;
                  const isBusy =
                    activeActionId === `${actionPathBase}/star` ||
                    activeActionId === `${actionPathBase}/trash` ||
                    activeActionId === `${actionPathBase}/delete`;

                  return (
                    <article key={item.id} className="soft-panel overflow-hidden rounded-[1.6rem] p-4 transition hover:translate-y-[-2px]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[var(--accent-soft)]">
                            {item.isFolder ? (
                              <Folder className="h-7 w-7 text-[var(--accent)]" />
                            ) : isImageFile(item) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.thumbnailUrl || item.fileUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : item.type === "application/pdf" ? (
                              <FileText className="h-7 w-7 text-[var(--accent)]" />
                            ) : (
                              <File className="h-7 w-7 text-[var(--accent)]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 overflow-hidden">
                            <h3 className="truncate text-lg font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted">{fileTypeLabel(item)}</p>
                          </div>
                        </div>

                        {item.isStarred && !item.isTrash ? <Star className="h-5 w-5 flex-shrink-0 fill-[var(--accent)] text-[var(--accent)]" /> : null}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted">
                        <div className="rounded-2xl bg-white/70 px-3 py-2">
                          <p className="text-xs uppercase tracking-[0.14em]">Size</p>
                          <p className="mt-1 font-medium text-[var(--foreground)]">{item.isFolder ? "--" : formatBytes(item.size)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/70 px-3 py-2">
                          <p className="text-xs uppercase tracking-[0.14em]">Updated</p>
                          <p className="mt-1 font-medium text-[var(--foreground)]">{formatDate(item.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.isFolder ? (
                          <Button
                            className="h-10 rounded-full bg-[var(--foreground)] px-4 text-xs font-medium text-white"
                            onPress={() => updateRoute("all", item.id)}
                          >
                            Open
                          </Button>
                        ) : (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 text-xs font-medium text-white"
                          >
                            <Download className="h-4 w-4" />
                            Open
                          </a>
                        )}

                        {!item.isTrash ? (
                          <Button
                            className="h-10 rounded-full border border-[var(--border)] bg-white px-4 text-xs font-medium text-[var(--foreground)]"
                            onPress={() =>
                              updateItem(
                                `${actionPathBase}/star`,
                                "PATCH",
                                item.isStarred ? "Removed from starred." : "Added to starred.",
                              )
                            }
                            isDisabled={isBusy}
                          >
                            <Star className={`h-4 w-4 ${item.isStarred ? "fill-[var(--accent)] text-[var(--accent)]" : ""}`} />
                            {item.isStarred ? "Unstar" : "Star"}
                          </Button>
                        ) : null}

                        <Button
                          className="h-10 rounded-full border border-[var(--border)] bg-white px-4 text-xs font-medium text-[var(--foreground)]"
                          onPress={() =>
                            updateItem(
                              `${actionPathBase}/trash`,
                              "PATCH",
                              item.isTrash ? "Item restored." : "Moved to trash.",
                            )
                          }
                          isDisabled={isBusy}
                        >
                          <Trash2 className="h-4 w-4" />
                          {item.isTrash ? "Restore" : "Trash"}
                        </Button>

                        {item.isTrash ? (
                          <Button
                            className="h-10 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-medium text-red-700"
                            onPress={() =>
                              updateItem(`${actionPathBase}/delete`, "DELETE", "Item deleted permanently.")
                            }
                            isDisabled={isBusy}
                          >
                            Delete now
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
