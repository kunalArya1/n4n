import { Handle, Position } from "@xyflow/react";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";

export default function SwitchNode({ data, selected }: any) {
  return (
    <div className={`px-4 py-3 shadow-sm rounded-md bg-background border min-w-[150px] transition-all ${selected ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md" : "border-border hover:border-indigo-300"}`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-500 border-2 border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 p-1.5 shrink-0">
          <HiOutlineArrowsRightLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="font-medium text-sm text-foreground truncate">{data.label || "Switch"}</div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {(data.cases || ["Case 1", "Default"]).map((c: string, i: number) => (
          <div key={i} className="flex items-center justify-end text-[10px] text-muted-foreground uppercase font-semibold relative">
            <span>{c}</span>
            <Handle
              type="source"
              id={`case-${i}`}
              position={Position.Right}
              style={{ top: '50%', right: '-16px' }}
              className="w-2.5 h-2.5 bg-indigo-500 border-2 border-background"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
