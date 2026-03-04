import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border/40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            {/* <span className="text-lg font-semibold tracking-tight">n4n</span> */}
          </Link>
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">
                Welcome back, <span className="font-semibold">{user?.firstName || "User"}</span>
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="bg-muted mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <span className="bg-primary h-2 w-2 rounded-full" />
            <span className="text-muted-foreground">Workflow automation, simplified</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Automate your workflows with{" "}
            <span className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-transparent">
              n4n
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-lg text-lg">
            Build, connect, and automate workflows visually. No code required. Powerful enough for
            developers, simple enough for everyone.
          </p>
          <SignedOut>
            <div className="flex items-center justify-center gap-4">
              <SignUpButton mode="modal">
                <Button size="lg" className="px-8">
                  Start Building
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="px-8">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/40 border-t py-6">
        <p className="text-muted-foreground text-center text-xs">
          &copy; {new Date().getFullYear()} n4n. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
