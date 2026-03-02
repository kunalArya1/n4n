"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import WorkspaceGrid from "./WorkspaceGrid";
import TrashGrid from "./TrashGrid";
import { Workspace } from "@/types";

export default function WorkspaceContainer({
  initialWorkspaces,
}: {
  initialWorkspaces: Workspace[];
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [trashWorkspaces, setTrashWorkspaces] = useState<Workspace[]>([]);
  const [showTrash, setShowTrash] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  function handleSoftDelete(id: string) {
    const ws = workspaces.find((w) => w.id === id);
    if (!ws) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setTrashWorkspaces((prev) => [
      {
        ...ws,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function handleRestore(id: string) {
    const ws = trashWorkspaces.find((w) => w.id === id);
    if (!ws) return;
    setTrashWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setWorkspaces((prev) => [{ ...ws, isDeleted: false, deletedAt: null }, ...prev]);
  }

  function handlePermanentDelete(id: string) {
    setTrashWorkspaces((prev) => prev.filter((w) => w.id !== id));
  }

  function handleEmptyTrash() {
    setTrashWorkspaces([]);
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {showTrash ? "Trash" : "Workspaces"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {showTrash
              ? "Access deleted workspaces and files"
              : "Organize and manage your projects"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showTrash && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setCreateOpen(true)}
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Create
            </Button>
          )}
          {showTrash && trashWorkspaces.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2 text-xs"
              onClick={handleEmptyTrash}
            >
              <HiOutlineTrash className="h-3.5 w-3.5" />
              Empty Trash
            </Button>
          )}
          <Button
            variant={showTrash ? "secondary" : "outline"}
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setShowTrash(!showTrash)}
          >
            {showTrash ? (
              <>
                <HiOutlineArrowPath className="h-3.5 w-3.5" />
                Back to Workspaces
              </>
            ) : (
              <>
                <HiOutlineTrash className="h-3.5 w-3.5" />
                Trash
              </>
            )}
          </Button>
        </div>
      </div>

      {!showTrash ? (
        <WorkspaceGrid
          workspaces={workspaces}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])}
          onRenamed={(ws) =>
            setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? { ...w, name: ws.name } : w)))
          }
          onDeleted={handleSoftDelete}
        />
      ) : (
        <TrashGrid
          workspaces={trashWorkspaces}
          onRestored={handleRestore}
          onPermanentDeleted={handlePermanentDelete}
        />
      )}
    </>
  );
}
