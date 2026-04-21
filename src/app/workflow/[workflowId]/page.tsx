"use client";

import { use, useState } from "react";
import WorkflowEditor from "@/components/workflow-editor/WorkflowEditor";
import { HiOutlineArrowLeft, HiOutlineArrowUpTray, HiOutlinePlay } from "react-icons/hi2";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function WorkflowPage({ params, searchParams }: { params: Promise<{ workflowId: string }>; searchParams: Promise<{ name?: string }> }) {
  const router = useRouter();
  const { workflowId } = use(params);
  const search = use(searchParams);
  const workflowName = search.name ? decodeURIComponent(search.name) : `Workflow ${workflowId}`;
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Add real save logic here later
    setHasChanges(false);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <div className="border-b bg-background/95 p-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <HiOutlineArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">{workflowName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <HiOutlineArrowUpTray className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8" disabled={!hasChanges} onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button size="sm" className="h-8">
            <HiOutlinePlay className="h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <WorkflowEditor workflowId={workflowId} onStateChange={(changes) => setHasChanges(changes)} />
      </div>
    </div>
  );
}
