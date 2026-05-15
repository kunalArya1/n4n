"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import { MdDeleteOutline } from "react-icons/md";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import WorkspaceGrid from "./WorkspaceGrid";
import TrashGrid from "./TrashGrid";
import { SearchBar, type SortOption } from "./SearchBar";
import { Workspace } from "@/types";

export default function WorkspaceContainer({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [trashWorkspaces, setTrashWorkspaces] = useState<Workspace[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trashSelectedIds, setTrashSelectedIds] = useState<Set<string>>(new Set());
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);

  const filteredWorkspaces = useMemo(() => {
    let result = [...workspaces];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((ws) => ws.name.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q));
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
    return trashWorkspaces.filter((ws) => ws.name.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q));
  }, [trashWorkspaces, searchQuery]);

  function handleSoftDelete(id: string) {
    const ws = workspaces.find((w) => w.id === id);
    if (!ws) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setTrashWorkspaces((prev) => [{ ...ws, isDeleted: true, deletedAt: new Date().toISOString() }, ...prev]);
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handleBatchSoftDelete() {
    const ids = selectedIds;
    const toTrash = workspaces.filter((w) => ids.has(w.id));
    setWorkspaces((prev) => prev.filter((w) => !ids.has(w.id)));
    setTrashWorkspaces((prev) => [...toTrash.map((ws) => ({ ...ws, isDeleted: true, deletedAt: new Date().toISOString() })), ...prev]);
    setSelectedIds(new Set());
  }

  function handleRestore(id: string) {
    const ws = trashWorkspaces.find((w) => w.id === id);
    if (!ws) return;
    setTrashWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setWorkspaces((prev) => [{ ...ws, isDeleted: false, deletedAt: null }, ...prev]);
    setTrashSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handlePermanentDelete(id: string) {
    setTrashWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setTrashSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handleEmptyTrash() {
    setTrashWorkspaces([]);
    setTrashSelectedIds(new Set());
  }

  const displayedCount = showTrash ? filteredTrash.length : filteredWorkspaces.length;

  return (
    <>
      {/* Header row */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">{showTrash ? "Trash" : "Workspaces"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{showTrash ? "Access deleted workspaces and files" : "Organize and manage your projects"}</p>
          </div>

          <div className="order-2 flex max-w-full min-w-45 flex-1 items-center gap-2 sm:order-0">
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={searchQuery.trim() ? displayedCount : undefined}
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!showTrash && (
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setCreateOpen(true)}>
                <HiOutlinePlus className="h-3.5 w-3.5" />
                Create
              </Button>
            )}

            {showTrash && trashWorkspaces.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2 text-xs" onClick={() => setEmptyTrashOpen(true)}>
                <HiOutlineTrash className="h-3.5 w-3.5" />
                Empty Trash
              </Button>
            )}

            <Button
              variant={showTrash ? "secondary" : "outline"}
              size="sm"
              className="gap-2 text-xs"
              onClick={() => {
                setShowTrash(!showTrash);
                setSearchQuery("");
                setSortBy("date-newest");
                setSelectedIds(new Set());
                setTrashSelectedIds(new Set());
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

      {/* Selection toolbar for main workspace view */}
      {!showTrash && selectedIds.size > 0 && (
        <div className="bg-muted/80 border-border mb-4 flex items-center gap-3 rounded border px-4 py-2.5 backdrop-blur-sm">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="bg-border h-4 w-px" />
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={handleBatchSoftDelete}>
            <MdDeleteOutline className="mr-1.5 h-3.5 w-3.5" />
            Move to Trash
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {!showTrash ? (
        <WorkspaceGrid
          workspaces={filteredWorkspaces}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])}
          onRenamed={(ws) => setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? { ...w, name: ws.name } : w)))}
          onDeleted={handleSoftDelete}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      ) : (
        <TrashGrid
          workspaces={filteredTrash}
          onRestored={handleRestore}
          onPermanentDeleted={handlePermanentDelete}
          selectedIds={trashSelectedIds}
          onSelectionChange={setTrashSelectedIds}
        />
      )}
      {/* Empty Trash Confirmation Dialog */}
      <Dialog open={emptyTrashOpen} onOpenChange={setEmptyTrashOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">Are you sure you want to permanently delete all items in the trash? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmptyTrashOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleEmptyTrash();
                setEmptyTrashOpen(false);
              }}
            >
              Empty Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
