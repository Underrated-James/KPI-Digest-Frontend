"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "../../domain/types/user-types";

const roleOptions: Array<{ label: string; value: UserRole | "ALL" }> = [
  { label: "All Roles", value: "ALL" },
  { label: "Developers", value: "DEVS" },
  { label: "QA Engineers", value: "QA" },
  { label: "Administrators", value: "ADMIN" },
];

interface UserPageToolbarProps {
  searchTerm: string;
  selectedRole: UserRole | null;
  selectedUserCount: number;
  isMobile: boolean;
  onSearchTermChange: (value: string) => void;
  onRoleChange: (role: UserRole | "ALL") => void;
  onAddUser: () => void;
  onBulkDelete: () => void;
}

export function UserPageToolbar({
  searchTerm,
  selectedRole,
  selectedUserCount,
  isMobile,
  onSearchTermChange,
  onRoleChange,
  onAddUser,
  onBulkDelete,
}: UserPageToolbarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)] xl:flex-1">
            <div className="space-y-3">
              <label
                htmlFor="user-search"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Search Users
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user-search"
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                  placeholder={
                    isMobile
                      ? "Search users..."
                      : "Search by keyword..."
                  }
                  className="h-11 border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="user-role-filter"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Filter By Role
              </label>
              <div className="relative">
                <select
                  id="user-role-filter"
                  value={selectedRole ?? "ALL"}
                  onChange={(event) =>
                    onRoleChange(event.target.value as UserRole | "ALL")
                  }
                  className="flex h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/50"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap xl:justify-end xl:self-end">
            <Button
              onClick={onAddUser}
              className="h-11 w-full cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl md:w-auto md:min-w-[140px]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer border-destructive/20 text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[180px]"
              onClick={onBulkDelete}
              disabled={selectedUserCount === 0}
            >
              <Trash2 className="mr-2 h-4 w-4 text-current" />
              Delete Selected ({selectedUserCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
