import { Handle, Position } from "@xyflow/react";
import { HiOutlineArrowPathRoundedSquare } from "react-icons/hi2";

export default function LoopNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-pink-500 ring-2 ring-pink-500/20 shadow-md" : "border-border hover:border-pink-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-pink-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-pink-100 dark:bg-pink-500/20 p-1.5 shrink-0">
          <HiOutlineArrowPathRoundedSquare className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Loop"}</div>
      </div>
      
      <div className="mt-3 flex flex-col gap-2 relative">
        <div className="flex items-center justify-end text-[10px] text-muted-foreground uppercase font-semibold">
          <span className="mr-2">Body</span>
          <Handle type="source" id="body" position={Position.Right} style={{ top: '65%' }} className="w-2 h-2 bg-pink-500 border border-background" />
        </div>
        <div className="flex items-center justify-end text-[10px] text-muted-foreground uppercase font-semibold">
          <span className="mr-2">Done</span>
          <Handle type="source" id="done" position={Position.Right} style={{ top: '85%' }} className="w-2 h-2 bg-slate-500 border border-background" />
        </div>
      </div>
    </div>
  );
}
