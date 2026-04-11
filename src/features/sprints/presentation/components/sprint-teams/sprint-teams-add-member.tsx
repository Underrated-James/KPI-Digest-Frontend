"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/features/users/domain/types/user-types";

interface SprintTeamsAddMemberProps {
  availableUsers: User[];
  userSearchQuery: string;
  onUserSearchChange: (query: string) => void;
  onAddMember: (user: User) => void;
  isLoading: boolean;
}

const roleBadgeColors: Record<string, string> = {
  DEVS: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  QA: "bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  ADMIN:
    "bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SprintTeamsAddMember({
  availableUsers,
  userSearchQuery,
  onUserSearchChange,
  onAddMember,
  isLoading,
}: SprintTeamsAddMemberProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  // Close on outside click
  useEffect(() => {
    if (!isSearching) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSearching]);

  const handleConfirm = () => {
    if (selected) {
      onAddMember(selected);
      setSelected(null);
      onUserSearchChange("");
      setIsSearching(false);
    }
  };

  const handleCancel = () => {
    setSelected(null);
    onUserSearchChange("");
    setIsSearching(false);
  };

  const handleSelect = (user: User) => {
    setSelected(user);
    onUserSearchChange(user.name);
  };

  if (!isSearching) {
    return (
      <button
        onClick={() => setIsSearching(true)}
        className="group flex h-14 w-full cursor-pointer items-center gap-3 border-b border-dashed border-border/50 px-4 transition-colors hover:bg-muted/30"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/50">
          <Plus className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
        </div>
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          Add Team Member
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative border-b border-dashed border-primary/30 bg-muted/20"
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={userSearchQuery}
          onChange={(e) => {
            onUserSearchChange(e.target.value);
            setSelected(null);
          }}
          placeholder="Search by name or role..."
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            selected
              ? "text-emerald-500 hover:bg-emerald-500/10"
              : "cursor-not-allowed text-muted-foreground/30",
          )}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown */}
      {!selected && (
        <div className="absolute left-0 right-0 top-14 z-30 max-h-52 overflow-y-auto rounded-b-lg border border-border bg-popover shadow-xl">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-xs text-muted-foreground">
              Loading users...
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-muted-foreground">
              No matching members found
            </div>
          ) : (
            availableUsers.slice(0, 20).map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold",
                    roleBadgeColors[user.role] ??
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {user.role}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
