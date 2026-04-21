import { Handle, Position } from "@xyflow/react";
import { HiOutlinePlay } from "react-icons/hi2";

export default function StartNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "border-border hover:border-emerald-300"}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-1.5 shrink-0">
          <HiOutlinePlay className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Start"}</div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
        <span>Format</span>
        <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">{data.inputFormat || "json"}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-background" />
    </div>
  );
}
