import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/workspace(.*)"]);
const isPublicHome = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  if (session.userId && isPublicHome(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!session.userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
