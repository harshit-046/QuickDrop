export type DashboardView = "all" | "starred" | "trash";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  storageId: string | null;
  userId: string;
  parentId: string | null;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalItems: number;
  totalFolders: number;
  totalStarred: number;
  totalTrash: number;
  totalStorageBytes: number;
}

export interface DashboardData {
  view: DashboardView;
  currentFolder: FileItem | null;
  breadcrumbs: FileItem[];
  items: FileItem[];
  stats: DashboardStats;
}
