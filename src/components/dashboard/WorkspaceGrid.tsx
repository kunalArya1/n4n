"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HiOutlineFolder } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import { Workspace } from "@/types";

interface WorkspaceGridProps {
  workspaces: Workspace[];
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  onCreated: (ws: Workspace) => void;
  onRenamed: (ws: Workspace) => void;
  onDeleted: (id: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function WorkspaceGrid({
  workspaces,
  createOpen,
  onCreateOpenChange,
  onCreated,
  onRenamed,
  onDeleted,
  selectedIds,
  onSelectionChange,
}: WorkspaceGridProps) {
  const router = useRouter();

  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);

  function handleCreate() {
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const ws: Workspace = {
      id: `ws-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      _count: { workflows: 0 },
    };
    onCreated(ws);
    setNewName("");
    setNewDescription("");
    onCreateOpenChange(false);
  }

  function handleRename() {
    if (!selectedWs || !newName.trim()) return;
    onRenamed({ ...selectedWs, name: newName.trim() });
    setRenameOpen(false);
    setNewName("");
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  }

  return (
    <div className="relative min-h-125" onClick={() => onSelectionChange(new Set())}>
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted mb-4 rounded p-4">
            <HiOutlineFolder className="text-muted-foreground h-8 w-8" />
          </div>
          <p className="text-muted-foreground text-sm">Workspace is empty.</p>
          <p className="text-muted-foreground text-sm">
            Click <strong>+ Create</strong> to add a new workflow workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workspaces.map((ws) => {
            const isSelected = selectedIds.has(ws.id);
            return (
              <Card
                key={ws.id}
                className={`group hover:shadow-primary/5 hover:border-primary/30 relative cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "border-primary/50 bg-primary/5 shadow-primary/10 ring-primary shadow-md ring-1" : ""
                }`}
                onClick={() => router.push(`/workspace/${ws.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`shrink-0 cursor-pointer rounded p-2 transition-colors ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-linear-to-br from-violet-500/10 to-indigo-500/10 hover:bg-violet-500/20"
                      }`}
                      onClick={(e) => toggleSelect(ws.id, e)}
                    >
                      {isSelected ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <HiOutlineFolder className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm leading-tight font-semibold">{ws.name}</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        {ws._count.workflows} workflow{ws._count.workflows !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                        <BsThreeDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWs(ws);
                          setNewName(ws.name);
                          setRenameOpen(true);
                        }}
                      >
                        <MdEdit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleted(ws.id)}>
                        <MdDeleteOutline className="mr-2 h-4 w-4" />
                        Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-1 truncate text-xs">{ws.description || "No description"}</p>
                  <p className="text-muted-foreground truncate text-[11px]" suppressHydrationWarning>
                    Last updated{" "}
                    {new Date(ws.updatedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNewName("");
            setNewDescription("");
          }
          onCreateOpenChange(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <p className="text-muted-foreground text-sm">Set up a new workspace to organize your workflows.</p>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ws-name">Name</Label>
              <Input
                id="ws-name"
                placeholder="e.g. Marketing Automation"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ws-desc">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="ws-desc"
                placeholder="Brief description of this workspace"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="max-h-18 resize-none overflow-y-auto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onCreateOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="New name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
