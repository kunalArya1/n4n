"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineFolder, HiOutlineTrash } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteForever, MdRestoreFromTrash } from "react-icons/md";
import { Workspace } from "@/types";

interface TrashGridProps {
  workspaces: Workspace[];
  onRestored: (id: string) => void;
  onPermanentDeleted: (id: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function TrashGrid({
  workspaces, onRestored, onPermanentDeleted, selectedIds, onSelectionChange,
}: TrashGridProps) {
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  function handlePermanentDelete() {
    if (!selectedWs) return;
    onPermanentDeleted(selectedWs.id);
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

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-4 rounded p-4">
          <HiOutlineTrash className="text-muted-foreground h-8 w-8" />
        </div>
        <p className="text-muted-foreground text-sm">Trash is empty.</p>
        <p className="text-muted-foreground text-sm">Deleted items will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]" onClick={() => onSelectionChange(new Set())}>
      {hasSelection && (
        <div className="bg-muted/80 border-border mb-4 flex items-center gap-3 rounded border px-4 py-2.5 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="bg-border h-4 w-px" />
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
            selectedIds.forEach((id) => onRestored(id));
            onSelectionChange(new Set());
          }}>
            <MdRestoreFromTrash className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Restore Selected
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs"
            onClick={() => setBatchDeleteOpen(true)}>
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
        {workspaces.map((ws) => {
          const isSelected = selectedIds.has(ws.id);
          return (
            <Card key={ws.id}
              className={`group relative border-dashed opacity-75 cursor-pointer transition-all hover:opacity-100 ${isSelected ? "border-primary/50 bg-primary/5 !opacity-100 ring-1 ring-primary" : ""}`}
              onClick={(e) => toggleSelect(ws.id, e)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="bg-muted shrink-0 rounded p-2">
                    <HiOutlineFolder className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-muted-foreground truncate text-sm leading-tight font-semibold">{ws.name}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      {ws._count.workflows} workflow{ws._count.workflows !== 1 ? "s" : ""}
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
                    <DropdownMenuItem onClick={() => onRestored(ws.id)}>
                      <MdRestoreFromTrash className="mr-2 h-4 w-4 text-emerald-500" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive"
                      onClick={() => { setSelectedWs(ws); setPermanentDeleteOpen(true); }}>
                      <MdDeleteForever className="mr-2 h-4 w-4" />
                      Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground truncate text-[11px]" suppressHydrationWarning>
                  Deleted {ws.deletedAt ? new Date(ws.deletedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={permanentDeleteOpen} onOpenChange={setPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Permanently</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to permanently delete <strong>{selectedWs?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handlePermanentDelete}>Delete Forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {selectedIds.size} Item{selectedIds.size !== 1 ? "s" : ""} Permanently</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to permanently delete <strong>{selectedIds.size} workspace{selectedIds.size !== 1 ? "s" : ""}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBatchPermanentDelete}>Delete Forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
