"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { HiOutlineBolt } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit, MdDeleteOutline, MdPlayArrow, MdPause, MdDownload } from "react-icons/md";
import { Workflow, WorkflowStatus } from "@/types";

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-slate-400", bg: "bg-slate-400/10" },
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  paused: { label: "Paused", color: "text-amber-400", bg: "bg-amber-400/10" },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-400/10" },
};

interface WorkflowGridProps {
  workflows: Workflow[];
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  onCreated: (wf: Workflow) => void;
  onRenamed: (wf: Workflow) => void;
  onDeleted: (id: string) => void;
  onStatusChanged: (id: string, status: WorkflowStatus) => void;
  workspaceId: string;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function WorkflowGrid({
  workflows,
  createOpen,
  onCreateOpenChange,
  onCreated,
  onRenamed,
  onDeleted,
  onStatusChanged,
  workspaceId,
  selectedIds,
  onSelectionChange,
}: WorkflowGridProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const router = useRouter();

  function handleCreate() {
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const wf: Workflow = {
      id: `wf-${Date.now()}`,
      workspaceId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      status: "draft",
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      _count: { nodes: 0, edges: 0 },
    };
    onCreated(wf);
    setNewName("");
    setNewDescription("");
    onCreateOpenChange(false);
  }

  function handleRename() {
    if (!selectedWf || !newName.trim()) return;
    onRenamed({ ...selectedWf, name: newName.trim() });
    setRenameOpen(false);
    setNewName("");
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  return (
    <div className="relative min-h-125" onClick={() => onSelectionChange(new Set())}>
      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted mb-4 rounded p-4">
            <HiOutlineBolt className="text-muted-foreground h-8 w-8" />
          </div>
          <p className="text-muted-foreground text-sm">No workflows yet.</p>
          <p className="text-muted-foreground text-sm">
            Click <strong>+ Create</strong> to add a new workflow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workflows.map((wf) => {
            const statusCfg = STATUS_CONFIG[wf.status];
            const isSelected = selectedIds.has(wf.id);
            return (
              <Card
                key={wf.id}
                className={`group hover:shadow-primary/5 hover:border-primary/30 relative cursor-pointer transition-all hover:shadow-lg ${isSelected ? "border-primary/50 bg-primary/5 shadow-primary/10 ring-primary shadow-md ring-1" : ""}`}
                onClick={() => router.push(`/workflow/${wf.id}?name=${encodeURIComponent(wf.name)}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`shrink-0 cursor-pointer rounded p-2 transition-colors ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-linear-to-br from-cyan-500/10 to-blue-500/10 hover:bg-cyan-500/20"
                      }`}
                      onClick={(e) => toggleSelect(wf.id, e)}
                    >
                      {isSelected ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <HiOutlineBolt className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm leading-tight font-semibold">{wf.name}</CardTitle>
                      <CardDescription className="mt-0.5 flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-muted-foreground">
                          {wf._count.nodes} node{wf._count.nodes !== 1 ? "s" : ""}
                        </span>
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
                          setSelectedWf(wf);
                          setNewName(wf.name);
                          setRenameOpen(true);
                        }}
                      >
                        <MdEdit className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wf, null, 2));
                          const downloadAnchorNode = document.createElement("a");
                          downloadAnchorNode.setAttribute("href", dataStr);
                          downloadAnchorNode.setAttribute("download", `${wf.name}.json`);
                          document.body.appendChild(downloadAnchorNode);
                          downloadAnchorNode.click();
                          downloadAnchorNode.remove();
                        }}
                      >
                        <MdDownload className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {wf.status !== "active" && (
                        <DropdownMenuItem onClick={() => onStatusChanged(wf.id, "active")}>
                          <MdPlayArrow className="mr-2 h-4 w-4 text-emerald-500" /> Activate
                        </DropdownMenuItem>
                      )}
                      {wf.status === "active" && (
                        <DropdownMenuItem onClick={() => onStatusChanged(wf.id, "paused")}>
                          <MdPause className="mr-2 h-4 w-4 text-amber-500" /> Pause
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleted(wf.id)}>
                        <MdDeleteOutline className="mr-2 h-4 w-4" /> Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-1 truncate text-xs">{wf.description || "No description"}</p>
                  <p className="text-muted-foreground truncate text-[11px]" suppressHydrationWarning>
                    Last updated {new Date(wf.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
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
            <DialogTitle>Create Workflow</DialogTitle>
            <p className="text-muted-foreground text-sm">Add a new workflow to this workspace.</p>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="wf-name">Name</Label>
              <Input
                id="wf-name"
                placeholder="e.g. Email Drip Campaign"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wf-desc">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="wf-desc"
                placeholder="Brief description of this workflow"
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
