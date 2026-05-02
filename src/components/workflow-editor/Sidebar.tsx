import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCube,
  HiOutlinePlay,
  HiOutlineStop,
  HiOutlineCog6Tooth,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineArrowsRightLeft,
  HiOutlineUserGroup,
  HiOutlineServerStack,
  HiOutlineGlobeAlt,
  HiOutlineCircleStack
} from "react-icons/hi2";

export default function Sidebar({ expanded, setExpanded }: { expanded: boolean, setExpanded: (val: boolean) => void }) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`border-r bg-background transition-all duration-300 flex flex-col ${expanded ? "w-64" : "w-16"}`}>
      <div className="p-4 border-b flex items-center justify-between h-[53px]">
        {expanded && <span className="font-semibold text-sm">Components</span>}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => setExpanded(!expanded)}>
          {expanded ? <HiOutlineChevronLeft className="h-4 w-4" /> : <HiOutlineChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="nodes" className="w-full h-full flex flex-col">
          {expanded && (
            <div className="px-2 pt-2 pb-0">
              <TabsList className="w-full grid grid-cols-2 border bg-dark/50 p-0.5">
                <TabsTrigger value="nodes">Nodes</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="nodes" className="flex-1 overflow-y-auto p-2 m-0 data-[state=inactive]:hidden flex flex-col gap-2">
            {!expanded && <div className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-wider mb-2">Nodes</div>}
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'start')} draggable>
              <HiOutlinePlay className="h-4 w-4 text-emerald-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Start Node</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'end')} draggable>
              <HiOutlineStop className="h-4 w-4 text-red-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">End Node</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'process')} draggable>
              <HiOutlineCog6Tooth className="h-4 w-4 text-blue-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Process</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'condition')} draggable>
              <HiOutlineQuestionMarkCircle className="h-4 w-4 text-amber-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Condition</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'switch')} draggable>
              <HiOutlineArrowsRightLeft className="h-4 w-4 text-indigo-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Switch</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'loop')} draggable>
              <HiOutlineArrowPathRoundedSquare className="h-4 w-4 text-pink-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Loop</span>}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 overflow-y-auto p-2 m-0 data-[state=inactive]:hidden flex flex-col gap-2">
            {!expanded && <div className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Tools</div>}
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'agents')} draggable>
              <HiOutlineUserGroup className="h-4 w-4 text-cyan-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Agents</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'mcpserver')} draggable>
              <HiOutlineServerStack className="h-4 w-4 text-orange-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">MCP Servers</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'integrate')} draggable>
              <HiOutlineCube className="h-4 w-4 text-purple-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Integrate</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'webhook')} draggable>
              <HiOutlineGlobeAlt className="h-4 w-4 text-sky-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Webhook</span>}
            </div>
            <div className={`h-8 rounded-md border bg-card flex items-center cursor-pointer hover:border-primary/50 transition-colors ${expanded ? "w-full px-3 gap-3 justify-start" : "w-8 px-0 justify-center mx-auto"}`} onDragStart={(e) => onDragStart(e, 'database')} draggable>
              <HiOutlineCircleStack className="h-4 w-4 text-teal-500 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">Database</span>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
