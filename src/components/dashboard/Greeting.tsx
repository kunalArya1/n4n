"use client";

import { useSyncExternalStore } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function subscribe() {
  return () => {};
}

export function Greeting({ name }: { name: string }) {
  const greeting = useSyncExternalStore(subscribe, getGreeting, () => "Hello");

  return (
    <span className="text-sm text-white">
      {greeting}, <span className="font-semibold">{name}</span>
    </span>
  );
}
