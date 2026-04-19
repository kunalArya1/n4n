"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HiOutlineBolt, HiOutlineTrash } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteForever, MdRestoreFromTrash } from "react-icons/md";
import { Workflow } from "@/types";

interface WorkflowTrashGridProps {
  workflows: Workflow[];
  onRestored: (id: string) => void;
  onPermanentDeleted: (id: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function WorkflowTrashGrid({ workflows, onRestored, onPermanentDeleted, selectedIds, onSelectionChange }: WorkflowTrashGridProps) {
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  function handlePermanentDelete() {
    if (!selectedWf) return;
    onPermanentDeleted(selectedWf.id);
    setPermanentDeleteOpen(false);
  }

  function handleBatchPermanentDelete() {
    selectedIds.forEach((id) => onPermanentDeleted(id));
    onSelectionChange(new Set());
    setBatchDeleteOpen(false);
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  const hasSelection = selectedIds.size > 0;

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-4 rounded p-4">
          <HiOutlineTrash className="text-muted-foreground h-8 w-8" />
        </div>
        <p className="text-muted-foreground text-sm">Trash is empty.</p>
        <p className="text-muted-foreground text-sm">Deleted workflows will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-125" onClick={() => onSelectionChange(new Set())}>
      {hasSelection && (
        <div
          className="bg-muted/80 border-border mb-4 flex items-center gap-3 rounded border px-4 py-2.5 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="bg-border h-4 w-px" />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              selectedIds.forEach((id) => onRestored(id));
              onSelectionChange(new Set());
            }}
          >
            <MdRestoreFromTrash className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Restore Selected
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={() => setBatchDeleteOpen(true)}>
            <MdDeleteForever className="mr-1.5 h-3.5 w-3.5" />
            Delete Selected Forever
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onSelectionChange(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workflows.map((wf) => {
          const isSelected = selectedIds.has(wf.id);
          return (
            <Card
              key={wf.id}
              className={`group relative border-dashed opacity-75 transition-all hover:opacity-100 ${isSelected ? "border-primary/50 bg-primary/5 ring-primary opacity-100! ring-1" : ""}`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`shrink-0 cursor-pointer rounded p-2 transition-colors ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={(e) => toggleSelect(wf.id, e)}
                  >
                    {isSelected ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <HiOutlineBolt className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-muted-foreground truncate text-sm leading-tight font-semibold">{wf.name}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      {wf._count.nodes} node{wf._count.nodes !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                      <BsThreeDotsVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRestored(wf.id)}>
                      <MdRestoreFromTrash className="mr-2 h-4 w-4 text-emerald-500" /> Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setSelectedWf(wf);
                        setPermanentDeleteOpen(true);
                      }}
                    >
                      <MdDeleteForever className="mr-2 h-4 w-4" /> Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground truncate text-[11px]" suppressHydrationWarning>
                  Deleted {wf.deletedAt ? new Date(wf.deletedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Single permanent delete confirmation */}
      <Dialog open={permanentDeleteOpen} onOpenChange={setPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permanently</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to permanently delete <strong>{selectedWf?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete}>
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch permanent delete confirmation */}
      <Dialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.size} Workflow{selectedIds.size !== 1 ? "s" : ""} Permanently
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to permanently delete{" "}
            <strong>
              {selectedIds.size} workflow{selectedIds.size !== 1 ? "s" : ""}
            </strong>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBatchPermanentDelete}>
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
