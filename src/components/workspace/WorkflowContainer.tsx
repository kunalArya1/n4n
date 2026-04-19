"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import WorkflowGrid from "./WorkflowGrid";
import WorkflowTrashGrid from "./WorkflowTrashGrid";
import { WorkflowSearchBar, type WorkflowSortOption } from "./WorkflowSearchBar";
import { Workflow, WorkflowStatus } from "@/types";

interface WorkflowContainerProps {
  initialWorkflows: Workflow[];
  workspaceId: string;
  workspaceName: string;
}

export default function WorkflowContainer({
  initialWorkflows,
  workspaceId,
  workspaceName,
}: WorkflowContainerProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [trashWorkflows, setTrashWorkflows] = useState<Workflow[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<WorkflowSortOption>("date-newest");

  const filteredWorkflows = useMemo(() => {
    let result = [...workflows];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (wf) => wf.name.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q),
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
    return trashWorkflows.filter(
      (wf) => wf.name.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q),
    );
  }, [trashWorkflows, searchQuery]);

  function handleSoftDelete(id: string) {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setTrashWorkflows((prev) => [
      { ...wf, isDeleted: true, deletedAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  function handleRestore(id: string) {
    const wf = trashWorkflows.find((w) => w.id === id);
    if (!wf) return;
    setTrashWorkflows((prev) => prev.filter((w) => w.id !== id));
    setWorkflows((prev) => [{ ...wf, isDeleted: false, deletedAt: null }, ...prev]);
  }

  function handlePermanentDelete(id: string) {
    setTrashWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  function handleEmptyTrash() {
    setTrashWorkflows([]);
  }

  function handleStatusChanged(id: string, status: WorkflowStatus) {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === id ? { ...wf, status, updatedAt: new Date().toISOString() } : wf,
      ),
    );
  }

  const displayedCount = showTrash ? filteredTrash.length : filteredWorkflows.length;

  return (
    <>
      {/* Header row */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {showTrash ? "Trash" : "Workflows"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {showTrash
                ? "Access deleted workflows"
                : (
                  <>
                    in <span className="text-foreground font-medium">{workspaceName}</span>
                  </>
                )}
            </p>
          </div>

          {/* Search bar and filter */}
          <div className="order-2 flex max-w-full min-w-45 flex-1 items-center gap-2 sm:order-0">
            <WorkflowSearchBar
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
            {showTrash && trashWorkflows.length > 0 && (
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
                  Back to Workflows
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
        <WorkflowGrid
          workflows={filteredWorkflows}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
          onCreated={(wf) => setWorkflows((prev) => [wf, ...prev])}
          onRenamed={(wf) =>
            setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? { ...w, name: wf.name } : w)))
          }
          onDeleted={handleSoftDelete}
          onStatusChanged={handleStatusChanged}
          workspaceId={workspaceId}
        />
      ) : (
        <WorkflowTrashGrid
          workflows={filteredTrash}
          onRestored={handleRestore}
          onPermanentDeleted={handlePermanentDelete}
        />
      )}
    </>
  );
}
