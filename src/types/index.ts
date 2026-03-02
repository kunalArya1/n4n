export interface Workspace {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { workflows: number };
}
