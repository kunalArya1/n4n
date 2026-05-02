"use client";

import { useState, useCallback, useMemo } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Sidebar from "./Sidebar";
import ConfigPanel from "./ConfigPanel";
import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";
import ProcessNode from "./nodes/ProcessNode";
import ConditionNode from "./nodes/ConditionNode";
import SwitchNode from "./nodes/SwitchNode";
import LoopNode from "./nodes/LoopNode";
import IntegrateNode from "./nodes/IntegrateNode";
import AgentsNode from "./nodes/AgentsNode";
import MCPServerNode from "./nodes/MCPServerNode";
import WebhookNode from "./nodes/WebhookNode";
import DatabaseNode from "./nodes/DatabaseNode";

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  condition: ConditionNode,
  switch: SwitchNode,
  loop: LoopNode,
  integrate: IntegrateNode,
  agents: AgentsNode,
  mcpserver: MCPServerNode,
  webhook: WebhookNode,
  database: DatabaseNode,
};

const initialNodes: Node[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 250, y: 150 },
    data: { label: "Start", inputFormat: "json", inputValue: "{\n  \"message\": \"Hello World\"\n}" },
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 700, y: 150 },
    data: { label: "End", outputFormat: "json", outputValue: "{}" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "start-1", target: "end-1", animated: true, style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' } },
];

export default function WorkflowEditor({ workflowId, onStateChange }: { workflowId: string, onStateChange?: (hasChanges: boolean) => void }) {
  const [nodes, setNodes, originalOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !rfInstance) {
        return;
      }

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      setNodes((nds) => nds.concat(newNode));
      if (onStateChange) onStateChange(true);
    },
    [rfInstance, setNodes, onStateChange]
  );

  const onNodesChange = useCallback((changes: any) => {
    originalOnNodesChange(changes);
    if (onStateChange) onStateChange(true);
  }, [originalOnNodesChange, onStateChange]);

  const onEdgesChange = useCallback((changes: any) => {
    originalOnEdgesChange(changes);
    if (onStateChange) onStateChange(true);
  }, [originalOnEdgesChange, onStateChange]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' } }, eds));
    if (onStateChange) onStateChange(true);
  }, [setEdges, onStateChange]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const updateNodeData = useCallback((id: string, data: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ...data } };
        }
        return n;
      })
    );
    if (onStateChange) onStateChange(true);
  }, [setNodes, onStateChange]);

  return (
    <div className="flex h-full w-full">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 relative h-full bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#ccc" gap={16} />
          <Controls className="bg-background border shadow-sm" />
          <MiniMap className="bg-background border shadow-sm mask-image-rounded" />
        </ReactFlow>
      </div>

      {selectedNode && (
        <ConfigPanel node={selectedNode} onChange={updateNodeData} />
      )}
    </div>
  );
}
