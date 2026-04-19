import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkflowContainer from "@/components/workspace/WorkflowContainer";
import { Greeting } from "@/components/dashboard/Greeting";
import { HiOutlineChevronRight } from "react-icons/hi2";

export const dynamic = "force-dynamic";

const DUMMY_WORKSPACES: Record<
  string,
  { name: string; description: string; workflows: Parameters<typeof WorkflowContainer>[0]["initialWorkflows"] }
> = {
  "ws-1": {
    name: "Marketing Automation",
    description: "Automated email and social media workflows",
    workflows: [
      {
        id: "wf-1",
        workspaceId: "ws-1",
        name: "Email Drip Campaign",
        description: "Automated onboarding email sequence",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-02-20T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
        _count: { nodes: 8, edges: 7 },
      },
      {
        id: "wf-2",
        workspaceId: "ws-1",
        name: "Social Media Scheduler",
        description: "Schedule and post to multiple platforms",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-02-22T00:00:00.000Z",
        updatedAt: "2026-03-08T00:00:00.000Z",
        _count: { nodes: 12, edges: 14 },
      },
      {
        id: "wf-3",
        workspaceId: "ws-1",
        name: "Lead Scoring Pipeline",
        description: "Classify and route leads based on engagement",
        status: "paused",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-02-25T00:00:00.000Z",
        updatedAt: "2026-03-05T00:00:00.000Z",
        _count: { nodes: 6, edges: 5 },
      },
      {
        id: "wf-4",
        workspaceId: "ws-1",
        name: "Newsletter Builder",
        description: "Generate and send weekly newsletters",
        status: "draft",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-03-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
        _count: { nodes: 3, edges: 2 },
      },
      {
        id: "wf-5",
        workspaceId: "ws-1",
        name: "A/B Test Runner",
        description: "Run and evaluate email A/B tests",
        status: "error",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-02-28T00:00:00.000Z",
        updatedAt: "2026-03-02T00:00:00.000Z",
        _count: { nodes: 10, edges: 11 },
      },
    ],
  },
  "ws-2": {
    name: "Data Pipeline",
    description: "ETL workflows for analytics",
    workflows: [
      {
        id: "wf-6",
        workspaceId: "ws-2",
        name: "Daily ETL – Postgres to BigQuery",
        description: "Sync production data nightly",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-01-15T00:00:00.000Z",
        updatedAt: "2026-03-12T00:00:00.000Z",
        _count: { nodes: 15, edges: 18 },
      },
      {
        id: "wf-7",
        workspaceId: "ws-2",
        name: "Data Quality Checks",
        description: "Validate data integrity post-ETL",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-01-20T00:00:00.000Z",
        updatedAt: "2026-03-11T00:00:00.000Z",
        _count: { nodes: 7, edges: 6 },
      },
    ],
  },
  "ws-3": {
    name: "Customer Onboarding",
    description: "New user onboarding and welcome sequences",
    workflows: [
      {
        id: "wf-8",
        workspaceId: "ws-3",
        name: "Welcome Email Sequence",
        description: "Send welcome emails to new users",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
        _count: { nodes: 5, edges: 4 },
      },
    ],
  },
  "ws-4": {
    name: "DevOps Monitoring",
    description: "CI/CD and alerting workflows",
    workflows: [
      {
        id: "wf-9",
        workspaceId: "ws-4",
        name: "Deploy Canary Pipeline",
        description: "Canary deployments with auto-rollback",
        status: "active",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-01-05T00:00:00.000Z",
        updatedAt: "2026-03-14T00:00:00.000Z",
        _count: { nodes: 20, edges: 24 },
      },
      {
        id: "wf-10",
        workspaceId: "ws-4",
        name: "Slack Alert Router",
        description: "Route alerts to appropriate channels",
        status: "paused",
        isDeleted: false,
        deletedAt: null,
        createdAt: "2026-01-10T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
        _count: { nodes: 4, edges: 3 },
      },
    ],
  },
};

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const workspace = DUMMY_WORKSPACES[id];

  if (!workspace) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            </Link>
            <HiOutlineChevronRight className="text-muted-foreground h-3.5 w-3.5" />
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Workspaces
            </Link>
            <HiOutlineChevronRight className="text-muted-foreground h-3.5 w-3.5" />
            <span className="truncate text-sm font-medium">{workspace.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Greeting name={user.firstName || "User"} />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <WorkflowContainer
          initialWorkflows={JSON.parse(JSON.stringify(workspace.workflows))}
          workspaceId={id}
          workspaceName={workspace.name}
        />
      </main>
    </div>
  );
}
