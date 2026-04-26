"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineFunnel, HiXMark } from "react-icons/hi2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export type SortOption = "name-asc" | "name-desc" | "date-newest" | "date-oldest" | "workflows";

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "date-newest": "Newest first",
  "date-oldest": "Oldest first",
  workflows: "Most workflows",
};

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount?: number;
}

export function SearchBar({
  query,
  onQueryChange,
  sortBy,
  onSortChange,
  resultCount,
}: SearchBarProps) {
  return (
    <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-2">
      {/* Search input */}
      <div className="relative max-w-full min-w-30 flex-1">
        <Input
          placeholder="Search workspaces & workflows…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-9 w-full pr-8 text-sm"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort / Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <HiOutlineFunnel className="h-3.5 w-3.5" />
            <span className="sr-only">Sort & filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onSortChange(key)}
              className={sortBy === key ? "bg-accent" : ""}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Result count */}
      {query.trim() && resultCount !== undefined && (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
