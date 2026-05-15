import { Handle, Position } from "@xyflow/react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

export default function ConditionNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md" : "border-border hover:border-amber-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-amber-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-amber-100 dark:bg-amber-500/20 p-1.5 shrink-0">
          <HiOutlineQuestionMarkCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Condition"}</div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-end text-[10px] font-semibold relative">
          <span className="text-emerald-600 dark:text-emerald-400 uppercase">True</span>
          <Handle type="source" id="true" position={Position.Right} style={{ top: '50%', right: '-16px' }} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-background" />
        </div>
        <div className="flex items-center justify-end text-[10px] font-semibold relative">
          <span className="text-red-600 dark:text-red-400 uppercase">False</span>
          <Handle type="source" id="false" position={Position.Right} style={{ top: '50%', right: '-16px' }} className="w-2.5 h-2.5 bg-red-500 border-2 border-background" />
        </div>
      </div>
    </div>
  );
}
