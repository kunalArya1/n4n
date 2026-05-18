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

export type WorkflowStatus = "draft" | "active" | "paused" | "error";

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { nodes: number; edges: number };
}
