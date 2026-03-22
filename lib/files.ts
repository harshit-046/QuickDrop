import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { files, type FileRecord } from "@/lib/db/schema";
import type { DashboardData, DashboardStats, DashboardView, FileItem } from "@/types/files";

const ROOT_PATH_PREFIX = "/quickdrop";

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item";
}

function serializeItem(item: FileRecord): FileItem {
  return {
    ...item,
    thumbnailUrl: item.thumbnailUrl ?? null,
    storageId: item.storageId ?? null,
    parentId: item.parentId ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function sortItems(items: FileRecord[]) {
  return [...items].sort((left, right) => {
    if (left.isFolder !== right.isFolder) {
      return left.isFolder ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

function matchesSearch(item: FileRecord, search: string) {
  if (!search) {
    return true;
  }

  return item.name.toLowerCase().includes(search.toLowerCase());
}

function buildStats(items: FileRecord[]): DashboardStats {
  const activeItems = items.filter((item) => !item.isTrash);

  return {
    totalItems: activeItems.filter((item) => !item.isFolder).length,
    totalFolders: activeItems.filter((item) => item.isFolder).length,
    totalStarred: activeItems.filter((item) => item.isStarred).length,
    totalTrash: items.filter((item) => item.isTrash).length,
    totalStorageBytes: activeItems.reduce((total, item) => total + (item.isFolder ? 0 : item.size), 0),
  };
}

function buildBreadcrumbs(items: FileRecord[], folderId: string | null) {
  if (!folderId) {
    return [];
  }

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const breadcrumbs: FileRecord[] = [];
  let current = itemMap.get(folderId);

  while (current) {
    breadcrumbs.unshift(current);
    current = current.parentId ? itemMap.get(current.parentId) : undefined;
  }

  return breadcrumbs;
}

export function normalizeDashboardView(value: string | null): DashboardView {
  if (value === "starred" || value === "trash") {
    return value;
  }

  return "all";
}

export function buildFolderPath(userId: string, folderName: string, parentPath?: string | null) {
  const folderId = uuidv4().slice(0, 8);
  const basePath = parentPath ?? `${ROOT_PATH_PREFIX}/${userId}`;

  return `${basePath}/${slugifySegment(folderName)}-${folderId}`;
}

export function buildUploadFileName(originalName: string) {
  const lastDotIndex = originalName.lastIndexOf(".");
  const stem = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName;
  const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex + 1) : "";
  const safeStem = slugifySegment(stem);
  const suffix = uuidv4().slice(0, 8);

  return extension ? `${safeStem}-${suffix}.${extension}` : `${safeStem}-${suffix}`;
}

export async function getUserItems(userId: string) {
  return db.select().from(files).where(eq(files.userId, userId)).orderBy(asc(files.createdAt));
}

export async function getFolderById(userId: string, folderId: string) {
  const items = await getUserItems(userId);
  return items.find((item) => item.id === folderId && item.isFolder) ?? null;
}

export async function buildDashboardData(
  userId: string,
  view: DashboardView,
  parentId: string | null,
  search: string,
): Promise<DashboardData> {
  const items = await getUserItems(userId);
  const currentFolder =
    parentId === null ? null : items.find((item) => item.id === parentId && item.isFolder && !item.isTrash) ?? null;

  const filtered = (() => {
    if (view === "starred") {
      return items.filter((item) => item.isStarred && !item.isTrash && matchesSearch(item, search));
    }

    if (view === "trash") {
      return items.filter((item) => item.isTrash && matchesSearch(item, search));
    }

    return items.filter(
      (item) =>
        !item.isTrash &&
        item.parentId === (currentFolder?.id ?? null) &&
        matchesSearch(item, search),
    );
  })();

  return {
    view,
    currentFolder: currentFolder ? serializeItem(currentFolder) : null,
    breadcrumbs: buildBreadcrumbs(items.filter((item) => item.isFolder), currentFolder?.id ?? null).map(serializeItem),
    items: sortItems(filtered).map(serializeItem),
    stats: buildStats(items),
  };
}

export function collectDescendantIds(items: FileRecord[], rootId: string) {
  const descendants = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;

    for (const item of items) {
      if (item.parentId && descendants.has(item.parentId) && !descendants.has(item.id)) {
        descendants.add(item.id);
        changed = true;
      }
    }
  }

  return [...descendants];
}

export async function deleteItemsFromDatabase(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  return db.delete(files).where(inArray(files.id, ids)).returning();
}
