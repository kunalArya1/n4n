"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineFolder, HiOutlineTrash } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteForever, MdRestoreFromTrash } from "react-icons/md";
import { Workspace } from "@/types";

interface TrashGridProps {
  workspaces: Workspace[];
  onRestored: (id: string) => void;
  onPermanentDeleted: (id: string) => void;
}

export default function TrashGrid({ workspaces, onRestored, onPermanentDeleted }: TrashGridProps) {
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);

  function handleRestore(ws: Workspace) {
    onRestored(ws.id);
  }

  function handlePermanentDelete() {
    if (!selectedWs) return;
    onPermanentDeleted(selectedWs.id);
    setPermanentDeleteOpen(false);
  }

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
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workspaces.map((ws) => (
          <Card
            key={ws.id}
            className="group border-dashed opacity-75 transition-all hover:opacity-100"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="bg-muted shrink-0 rounded p-2">
                  <HiOutlineFolder className="text-muted-foreground h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-muted-foreground truncate text-sm leading-tight font-semibold">
                    {ws.name}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    {ws._count.workflows} workflow{ws._count.workflows !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <BsThreeDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRestore(ws)}>
                    <MdRestoreFromTrash className="mr-2 h-4 w-4 text-emerald-500" />
                    Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setSelectedWs(ws);
                      setPermanentDeleteOpen(true);
                    }}
                  >
                    <MdDeleteForever className="mr-2 h-4 w-4" />
                    Delete Forever
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground truncate text-[11px]" suppressHydrationWarning>
                Deleted{" "}
                {ws.deletedAt
                  ? new Date(ws.deletedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={permanentDeleteOpen} onOpenChange={setPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permanently</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to permanently delete <strong>{selectedWs?.name}</strong>? This
            will remove all workflows, nodes, and edges. This action cannot be undone.
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
    </>
  );
}
