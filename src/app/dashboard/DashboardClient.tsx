"use client";

import { useState } from "react";
import WorkspaceContainer from "@/components/dashboard/Workspace";

export default function DashboardClient({ 
  initialWorkspaces,
  sessionToken
}: { 
  initialWorkspaces: any[];
  sessionToken: string;
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <WorkspaceContainer 
        initialWorkspaces={workspaces} 
        sessionToken={sessionToken}
      />
    </div>
  );
}
