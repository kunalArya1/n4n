import { Handle, Position } from "@xyflow/react";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

export default function WebhookNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-sky-500 ring-2 ring-sky-500/20 shadow-md" : "border-border hover:border-sky-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-sky-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-sky-100 dark:bg-sky-500/20 p-1.5 shrink-0">
          <HiOutlineGlobeAlt className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Webhook"}</div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
        <span>Method</span>
        <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">{data.method || "POST"}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-sky-500 border-2 border-background" />
    </div>
  );
}
