"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import WorkspaceGrid from "./WorkspaceGrid";
import TrashGrid from "./TrashGrid";
import { SearchBar, type SortOption } from "./SearchBar";
import { Workspace } from "@/types";
import { createApplication, deleteApplication } from "@/lib/api";

export default function WorkspaceContainer({
  initialWorkspaces,
  sessionToken,
}: {
  initialWorkspaces: Workspace[];
  sessionToken: string;
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [trashWorkspaces, setTrashWorkspaces] = useState<Workspace[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");

  const filteredWorkspaces = useMemo(() => {
    let result = [...workspaces];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ws) => ws.name.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "date-oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "workflows":
          return b._count.workflows - a._count.workflows;
        default:
          return 0;
      }
    });
    return result;
  }, [workspaces, searchQuery, sortBy]);

  const filteredTrash = useMemo(() => {
    if (!searchQuery.trim()) return trashWorkspaces;
    const q = searchQuery.toLowerCase();
    return trashWorkspaces.filter(
      (ws) => ws.name.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q),
    );
  }, [trashWorkspaces, searchQuery]);

  function handleSoftDelete(id: string) {
    const ws = workspaces.find((w) => w.id === id);
    if (!ws) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setTrashWorkspaces((prev) => [
      { ...ws, isDeleted: true, deletedAt: new Date().toISOString() },
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

  const displayedCount = showTrash ? filteredTrash.length : filteredWorkspaces.length;

  return (
    <>
      {/* Header row */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {showTrash ? "Trash" : "Workspaces"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {showTrash
                ? "Access deleted workspaces and files"
                : "Organize and manage your projects"}
            </p>
          </div>

          {/* Search bar and filter */}
          <div className="order-2 flex max-w-full min-w-45 flex-1 items-center gap-2 sm:order-0">
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={searchQuery.trim() ? displayedCount : undefined}
            />
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Create */}
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

            {/* Empty trash */}
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

            {/* Trash / Back */}
            <Button
              variant={showTrash ? "secondary" : "outline"}
              size="sm"
              className="gap-2 text-xs"
              onClick={() => {
                setShowTrash(!showTrash);
                setSearchQuery("");
                setSortBy("date-newest");
              }}
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
      </div>

      {!showTrash ? (
        <WorkspaceGrid
          workspaces={filteredWorkspaces}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])}
          onRenamed={(ws) =>
            setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? { ...w, name: ws.name } : w)))
          }
          onDeleted={handleSoftDelete}
          sessionToken={sessionToken}
        />
      ) : (
        <TrashGrid
          workspaces={filteredTrash}
          onRestored={handleRestore}
          onPermanentDeleted={handlePermanentDelete}
        />
      )}
    </>
  );
}
