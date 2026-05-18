import { Handle, Position } from "@xyflow/react";
import { HiOutlineServerStack } from "react-icons/hi2";

export default function MCPServerNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md" : "border-border hover:border-orange-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-orange-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-orange-100 dark:bg-orange-500/20 p-1.5 shrink-0">
          <HiOutlineServerStack className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "MCP Server"}</div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
        <span>Server</span>
        <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">{data.server || "Local"}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-orange-500 border-2 border-background" />
    </div>
  );
}
