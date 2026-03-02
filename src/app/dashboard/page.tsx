import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkspaceGrid from "@/components/dashboard/Workspace";
import { Greeting } from "@/components/dashboard/Greeting";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dummyWorkspaces = [
    {
      id: "ws-1",
      name: "Marketing Automation",
      description: "Automated email and social media workflows",
      isDeleted: false,
      deletedAt: null,
      createdAt: "2026-02-23T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
      _count: { workflows: 5 },
    },
    {
      id: "ws-2",
      name: "Data Pipeline",
      description: "ETL workflows for analytics",
      isDeleted: false,
      deletedAt: null,
      createdAt: "2026-02-16T00:00:00.000Z",
      updatedAt: "2026-02-27T00:00:00.000Z",
      _count: { workflows: 12 },
    },
    {
      id: "ws-3",
      name: "Customer Onboarding",
      description: "New user onboarding and welcome sequences",
      isDeleted: false,
      deletedAt: null,
      createdAt: "2026-01-31T00:00:00.000Z",
      updatedAt: "2026-02-25T00:00:00.000Z",
      _count: { workflows: 3 },
    },
    {
      id: "ws-4",
      name: "DevOps Monitoring",
      description: "CI/CD and alerting workflows",
      isDeleted: false,
      deletedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-20T00:00:00.000Z",
      _count: { workflows: 8 },
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            {/* <h1 className="text-lg font-semibold tracking-tight">n4n</h1> */}
          </Link>
          <div className="flex items-center gap-4">
            <Greeting name={user.firstName || "User"} />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <WorkspaceGrid initialWorkspaces={JSON.parse(JSON.stringify(dummyWorkspaces))} />
      </main>
    </div>
  );
}
