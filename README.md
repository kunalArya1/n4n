# AI Workflow Automation Platform

A modern, highly-responsive web application built to streamline and manage AI-driven workflows. Users can create specialized workspaces, construct complex visual workflows, and manage their resources effortlessly.

## Features

- **Workspace Management**: Organize your automation processes into dedicated workspaces.
- **Workflow Orchestration**: Create, pause, and activate individual workflows with granular control.
- **Bulk Operations & Multi-Select**: Seamlessly select multiple workspaces or workflows to restore or move them to the trash.
- **Soft-Delete Architecture**: Items are safely moved to the Trash rather than being instantly removed, giving you peace of mind with batch restoration and permanent deletion workflows.
- **Secure Authentication**: Protected routes and user sessions backed by [Clerk](https://clerk.com/).
- **Responsive UI**: A fluid, modern interface built with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Library**: [React 19](https://react.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) & [Lucide](https://lucide.dev/)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Ensure your `.env` file is configured properly with your Clerk API keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
