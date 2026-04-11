"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { User } from "@/features/users/domain/types/user-types";
import { cn } from "@/lib/utils";
import { SprintTeamsAddMember } from "./sprint-teams-add-member";
import { SprintTeamsMemberRow } from "./sprint-teams-member-row";
import { SprintTeamsRemoveDialog } from "./sprint-teams-remove-dialog";
import type { SprintTeamMember } from "../../hooks/use-sprint-teams-page";

interface SprintTeamsMemberListProps {
  members: SprintTeamMember[];
  filteredMembers: SprintTeamMember[];
  workingHoursDay: number;
  isMobile: boolean;
  roleFilter: "ALL" | "DEVS" | "QA";
  availableUsers: User[];
  userSearchQuery: string;
  onUserSearchChange: (query: string) => void;
  onAddMember: (user: User) => void;
  onRemoveMember: (userId: string) => void;
  onAllocationChange: (userId: string, allocationPercentage: number) => void;
  isUsersLoading: boolean;
}

export function SprintTeamsMemberList({
  members,
  filteredMembers,
  workingHoursDay,
  isMobile,
  roleFilter,
  availableUsers,
  userSearchQuery,
  onUserSearchChange,
  onAddMember,
  onRemoveMember,
  onAllocationChange,
  isUsersLoading,
}: SprintTeamsMemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<SprintTeamMember | null>(
    null,
  );
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const handleRemoveClick = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    if (member) {
      setMemberToRemove(member);
      setRemoveDialogOpen(true);
    }
  };

  const handleRemoveConfirm = () => {
    if (memberToRemove) {
      onRemoveMember(memberToRemove.userId);
      setMemberToRemove(null);
    }
  };

  const effectiveHours = (allocationPercentage: number) =>
    Math.round(((workingHoursDay * allocationPercentage) / 100) * 10) / 10;

  const roleBadgeColors: Record<string, string> = {
    DEVS:
      "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
    QA: "bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  };

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Team Members ({members.length})
          </span>
          {!isMobile && (
            <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="w-[72px] text-center">Alloc.</span>
              <span className="w-[72px] text-center">Hr/Day</span>
              <span className="w-8" />
            </div>
          )}
        </div>

        {isMobile && filteredMembers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-border bg-muted/10 px-3 py-2">
            {filteredMembers.map((member) => (
              <div
                key={member.userId}
                className="group relative flex shrink-0 items-center gap-2 rounded-lg bg-muted/30 px-2.5 py-1.5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                  {member.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="max-w-[8rem] truncate text-[10px] font-semibold text-foreground">
                      {member.name}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                        roleBadgeColors[member.role] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    {effectiveHours(member.allocationPercentage)}h/day -{" "}
                    {member.allocationPercentage}%
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveClick(member.userId)}
                  className="rounded p-1 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length === 0 && members.length > 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No members match the current filter.
              </p>
            </div>
          )}

          {members.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <span className="text-2xl">Team</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                No team members yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click Add Team Member below to get started.
              </p>
            </div>
          )}

          {!isMobile &&
            filteredMembers.map((member, i) => (
              <SprintTeamsMemberRow
                key={member.userId}
                member={member}
                index={i}
                workingHoursDay={workingHoursDay}
                onRemove={handleRemoveClick}
                onAllocationChange={onAllocationChange}
              />
            ))}

          <SprintTeamsAddMember
            availableUsers={availableUsers}
            userSearchQuery={userSearchQuery}
            onUserSearchChange={onUserSearchChange}
            onAddMember={onAddMember}
            isLoading={isUsersLoading}
            roleFilter={roleFilter}
          />
        </div>
      </div>

      <SprintTeamsRemoveDialog
        member={memberToRemove}
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
