import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";

export default function ConfigPanel({ node, onChange }: { node: any, onChange: (id: string, data: any) => void }) {
  return (
    <div className="w-80 border-l bg-background flex flex-col h-full shadow-xl">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30 h-[53px]">
        <h3 className="font-semibold text-sm">Configuration</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md border uppercase">{node.type}</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Node Label</Label>
          <Input 
            value={node.data.label || ""} 
            onChange={(e) => onChange(node.id, { label: e.target.value })}
          />
        </div>

        {node.type === "start" && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Input Format</Label>
              <select 
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={node.data.inputFormat || "json"} 
                onChange={(e) => onChange(node.id, { inputFormat: e.target.value })}
              >
                <option value="json">JSON</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Input Value</Label>
              <Textarea 
                className="font-mono text-xs flex-1 min-h-[250px]"
                value={node.data.inputValue || ""}
                onChange={(e) => onChange(node.id, { inputValue: e.target.value })}
                placeholder={node.data.inputFormat === "json" ? "{}" : "Enter text here..."}
              />
            </div>
          </>
        )}

        {node.type === "end" && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Expected Output Format</Label>
              <select 
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={node.data.outputFormat || "json"} 
                onChange={(e) => onChange(node.id, { outputFormat: e.target.value })}
              >
                <option value="json">JSON</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Mock Output Value (for preview)</Label>
              <Textarea 
                className="font-mono text-xs flex-1 min-h-[250px]"
                value={node.data.outputValue || ""}
                onChange={(e) => onChange(node.id, { outputValue: e.target.value })}
                placeholder={node.data.outputFormat === "json" ? "{}" : "Output text..."}
                readOnly
              />
            </div>
          </>
        )}
        {node.type === "switch" && (
          <div className="flex flex-col gap-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Cases</Label>
            {(node.data.cases || ["Case 1", "Default"]).map((c: string, i: number, arr: string[]) => (
              <div key={i} className="flex gap-2 items-center">
                <Input 
                  value={c}
                  className="h-8 text-xs"
                  disabled={i === arr.length - 1} // Disable editing the last "Default" case
                  onChange={(e) => {
                    const newCases = [...(node.data.cases || ["Case 1", "Default"])];
                    newCases[i] = e.target.value;
                    onChange(node.id, { cases: newCases });
                  }}
                />
                {i !== arr.length - 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => {
                    const newCases = [...(node.data.cases || ["Case 1", "Default"])];
                    newCases.splice(i, 1);
                    onChange(node.id, { cases: newCases });
                  }}>
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                )}
                {i === arr.length - 1 && (
                  <div className="h-8 w-8 shrink-0" /> // Spacer for alignment
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => {
              const newCases = [...(node.data.cases || ["Case 1", "Default"])];
              newCases.splice(newCases.length - 1, 0, `Case ${newCases.length}`);
              onChange(node.id, { cases: newCases });
            }}>
              <HiOutlinePlus className="h-4 w-4 mr-2" />
              Add Case
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
