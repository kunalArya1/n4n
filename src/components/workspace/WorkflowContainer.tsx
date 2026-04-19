"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import { MdDeleteOutline } from "react-icons/md";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import WorkflowGrid from "./WorkflowGrid";
import WorkflowTrashGrid from "./WorkflowTrashGrid";
import { WorkflowSearchBar, type WorkflowSortOption } from "./WorkflowSearchBar";
import { Workflow, WorkflowStatus } from "@/types";

interface WorkflowContainerProps {
  initialWorkflows: Workflow[];
  workspaceId: string;
  workspaceName: string;
}

export default function WorkflowContainer({ initialWorkflows, workspaceId, workspaceName }: WorkflowContainerProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [trashWorkflows, setTrashWorkflows] = useState<Workflow[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<WorkflowSortOption>("date-newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trashSelectedIds, setTrashSelectedIds] = useState<Set<string>>(new Set());

  const filteredWorkflows = useMemo(() => {
    let result = [...workflows];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((wf) => wf.name.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q));
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
        case "status": {
          const order: Record<WorkflowStatus, number> = { active: 0, paused: 1, draft: 2, error: 3 };
          return order[a.status] - order[b.status];
        }
        case "nodes":
          return b._count.nodes - a._count.nodes;
        default:
          return 0;
      }
    });
    return result;
  }, [workflows, searchQuery, sortBy]);

  const filteredTrash = useMemo(() => {
    if (!searchQuery.trim()) return trashWorkflows;
    const q = searchQuery.toLowerCase();
    return trashWorkflows.filter((wf) => wf.name.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q));
  }, [trashWorkflows, searchQuery]);

  function handleSoftDelete(id: string) {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setTrashWorkflows((prev) => [{ ...wf, isDeleted: true, deletedAt: new Date().toISOString() }, ...prev]);
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handleBatchSoftDelete() {
    const ids = selectedIds;
    const toTrash = workflows.filter((w) => ids.has(w.id));
    setWorkflows((prev) => prev.filter((w) => !ids.has(w.id)));
    setTrashWorkflows((prev) => [...toTrash.map((wf) => ({ ...wf, isDeleted: true, deletedAt: new Date().toISOString() })), ...prev]);
    setSelectedIds(new Set());
  }

  function handleRestore(id: string) {
    const wf = trashWorkflows.find((w) => w.id === id);
    if (!wf) return;
    setTrashWorkflows((prev) => prev.filter((w) => w.id !== id));
    setWorkflows((prev) => [{ ...wf, isDeleted: false, deletedAt: null }, ...prev]);
    setTrashSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handlePermanentDelete(id: string) {
    setTrashWorkflows((prev) => prev.filter((w) => w.id !== id));
    setTrashSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handleEmptyTrash() {
    setTrashWorkflows([]);
    setTrashSelectedIds(new Set());
  }

  function handleStatusChanged(id: string, status: WorkflowStatus) {
    setWorkflows((prev) => prev.map((wf) => (wf.id === id ? { ...wf, status, updatedAt: new Date().toISOString() } : wf)));
  }

  const displayedCount = showTrash ? filteredTrash.length : filteredWorkflows.length;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">{showTrash ? "Trash" : "Workflows"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {showTrash ? (
                "Access deleted workflows"
              ) : (
                <>
                  in <span className="text-foreground font-medium">{workspaceName}</span>
                </>
              )}
            </p>
          </div>

          <div className="order-2 flex max-w-full min-w-45 flex-1 items-center gap-2 sm:order-0">
            <WorkflowSearchBar
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
                <HiOutlinePlus className="h-3.5 w-3.5" /> Create
              </Button>
            )}

            {showTrash && trashWorkflows.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2 text-xs" onClick={() => setEmptyTrashOpen(true)}>
                <HiOutlineTrash className="h-3.5 w-3.5" /> Empty Trash
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
                  <HiOutlineArrowPath className="h-3.5 w-3.5" /> Back to Workflows
                </>
              ) : (
                <>
                  <HiOutlineTrash className="h-3.5 w-3.5" /> Trash
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Selection toolbar for main workflow view */}
      {!showTrash && selectedIds.size > 0 && (
        <div className="bg-muted/80 border-border mb-4 flex items-center gap-3 rounded border px-4 py-2.5 backdrop-blur-sm">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="bg-border h-4 w-px" />
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={handleBatchSoftDelete}>
            <MdDeleteOutline className="mr-1.5 h-3.5 w-3.5" /> Move to Trash
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {!showTrash ? (
        <WorkflowGrid
          workflows={filteredWorkflows}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          onCreated={(wf) => setWorkflows((prev) => [wf, ...prev])}
          onRenamed={(wf) => setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? { ...w, name: wf.name } : w)))}
          onDeleted={handleSoftDelete}
          onStatusChanged={handleStatusChanged}
          workspaceId={workspaceId}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      ) : (
        <WorkflowTrashGrid
          workflows={filteredTrash}
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
