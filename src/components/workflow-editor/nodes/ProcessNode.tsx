import { Handle, Position } from "@xyflow/react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

export default function ProcessNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md" : "border-border hover:border-blue-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-blue-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-blue-100 dark:bg-blue-500/20 p-1.5 shrink-0">
          <HiOutlineCog6Tooth className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Process"}</div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
        <span>Action</span>
        <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">{data.action || "none"}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-blue-500 border-2 border-background" />
    </div>
  );
}
