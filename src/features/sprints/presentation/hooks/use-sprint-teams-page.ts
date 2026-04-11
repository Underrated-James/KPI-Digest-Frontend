"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { useCreateTeam } from "@/features/teams/presentation/hooks/use-create-team";
import { useUpdateTeam } from "@/features/teams/presentation/hooks/use-update-team";
import { useUsers } from "@/features/users/presentation/hooks/use-users";
import { useIsMobile } from "@/hooks/use-mobile";
import { sprintService } from "../../infrastructure/sprint-service";
import { sprintKeys } from "../queries/sprint-keys";

import type {
  CreateTeamDTO,
  LeaveDays,
  ListOfUsers,
} from "@/features/teams/domain/types/team-types";
import { LeaveType } from "@/features/teams/domain/types/team-types";
import type { User } from "@/features/users/domain/types/user-types";
import type { DayOff } from "../../domain/types/sprint-types";

export interface SprintTeamMember {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  allocationPercentage: number;
  leave?: LeaveDays[];
}

// ─── Date utilities ────────────────────────────────────────

/** Normalise any date string (ISO / YYYY-MM-DD) to plain YYYY-MM-DD */
export function normalizeDate(dateStr: string): string {
  return dateStr.split("T")[0];
}

export function getSprintDays(startDate: string, endDate: string): Date[] {
  const days: Date[] = [];
  const current = new Date(normalizeDate(startDate) + "T00:00:00");
  const end = new Date(normalizeDate(endDate) + "T00:00:00");
  if (isNaN(current.getTime()) || isNaN(end.getTime())) return [];
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ─── Hook ──────────────────────────────────────────────────

interface UseSprintTeamsPageOptions {
  sprintId: string;
}

export function useSprintTeamsPage({ sprintId }: UseSprintTeamsPageOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const sprintName = searchParams.get("sprintName") ?? "";
  const projectId = searchParams.get("projectId") ?? "";
  const projectName = searchParams.get("projectName") ?? "";
  const hoursPerDayParam = Number(searchParams.get("hoursPerDay")) || 8;

  // Fetch the sprint to get startDate, endDate, dayOffs
  const sprintQuery = useQuery({
    queryKey: sprintKeys.detail(sprintId),
    queryFn: () => sprintService.getSprintById.execute(sprintId),
    enabled: Boolean(sprintId),
  });
  const sprint = sprintQuery.data ?? null;

  // Fetch existing team for this sprint
  const teamsQuery = useTeams({ sprintId, size: 1 });
  const existingTeam = teamsQuery.data?.content?.[0] ?? null;
  const isEditMode = Boolean(existingTeam);
  const teamId = existingTeam?.id ?? null;

  // Fetch users for Add Member dropdown
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const usersQuery = useUsers({ size: 100 });
  const allUsers = usersQuery.data?.users ?? [];

  // Mutations
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  // Local state
  const [members, setMembers] = useState<SprintTeamMember[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(hoursPerDayParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "DEVS" | "QA">("ALL");
  const [showWeekends, setShowWeekends] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Leave overrides: key = `${userId}:${date}`, value = LeaveType or null (removed)
  const [leaveOverrides, setLeaveOverrides] = useState<
    Record<string, LeaveType | null>
  >({});
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  // Populate members from existing team on first load
  useEffect(() => {
    if (isInitialized) return;
    if (teamsQuery.isLoading) return;

    if (existingTeam) {
      const mapped: SprintTeamMember[] = existingTeam.userIds.map((u) => ({
        userId: u.userId,
        name: u.name,
        role: u.role as "DEVS" | "QA",
        allocationPercentage: u.allocationPercentage ?? 100,
        leave: u.leave ?? [],
      }));
      setMembers(mapped);
      setHoursPerDay(existingTeam.hoursDay ?? hoursPerDayParam);
    }

    setIsInitialized(true);
  }, [existingTeam, teamsQuery.isLoading, isInitialized, hoursPerDayParam]);

  // ─── Timeline data ────────────────────────────────────────

  const sprintDays = useMemo(() => {
    if (!sprint) return [];
    const allDays = getSprintDays(sprint.startDate, sprint.endDate);
    return showWeekends ? allDays : allDays.filter((d) => !isWeekend(d));
  }, [sprint, showWeekends]);

  const dayOffDates = useMemo(() => {
    if (!sprint?.dayOff) return [];
    return sprint.dayOff.map((d: DayOff) => normalizeDate(d.date));
  }, [sprint?.dayOff]);

  // Leave management
  const setLeave = useCallback(
    (userId: string, date: string, type: LeaveType) => {
      setLeaveOverrides((prev) => ({ ...prev, [`${userId}:${date}`]: type }));
    },
    [],
  );

  const removeLeave = useCallback((userId: string, date: string) => {
    setLeaveOverrides((prev) => ({ ...prev, [`${userId}:${date}`]: null }));
  }, []);

  const getEffectiveLeave = useCallback(
    (
      userId: string,
      date: string,
      originalType?: LeaveType,
    ): LeaveType | undefined => {
      const key = `${userId}:${date}`;
      if (key in leaveOverrides) {
        const val = leaveOverrides[key];
        return val === null ? undefined : val;
      }
      return originalType;
    },
    [leaveOverrides],
  );

  // Build final members with merged leave data for save
  const getMembersWithLeave = useCallback((): SprintTeamMember[] => {
    return members.map((m) => {
      const originalLeaveMap = new Map(
        (m.leave ?? []).map((l) => [l.leaveDate, l]),
      );

      // Apply overrides
      for (const [key, val] of Object.entries(leaveOverrides)) {
        const [uid, date] = key.split(":");
        if (uid !== m.userId) continue;
        if (val === null) {
          originalLeaveMap.delete(date);
        } else {
          originalLeaveMap.set(date, { leaveType: [val], leaveDate: date });
        }
      }

      return { ...m, leave: Array.from(originalLeaveMap.values()) };
    });
  }, [members, leaveOverrides]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch = m.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, searchQuery, roleFilter]);

  // Available users (not already in team)
  const memberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  const availableUsers = useMemo(() => {
    return allUsers.filter((u: User) => {
      if (memberIds.has(u.id)) return false;
      if (!userSearchQuery) return true;
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
      );
    });
  }, [allUsers, memberIds, userSearchQuery]);

  // Member CRUD
  const addMember = useCallback((user: User) => {
    setMembers((prev) => [
      ...prev,
      {
        userId: user.id,
        name: user.name,
        role: user.role === "QA" ? "QA" : "DEVS",
        allocationPercentage: 100,
        leave: [],
      },
    ]);
  }, []);

  const removeMember = useCallback((userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }, []);

  const updateMemberRole = useCallback(
    (userId: string, role: "DEVS" | "QA") => {
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m)),
      );
    },
    [],
  );

  const updateMemberAllocation = useCallback(
    (userId: string, allocationPercentage: number) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId ? { ...m, allocationPercentage } : m,
        ),
      );
    },
    [],
  );

  // Save / Submit
  const handleSave = useCallback(() => {
    const finalMembers = getMembersWithLeave();

    if (finalMembers.length === 0) {
      toast.error("Please add at least one team member");
      return;
    }

    const userIds: ListOfUsers[] = finalMembers.map((m) => ({
      userId: m.userId,
      name: m.name,
      role: m.role,
      allocationPercentage: m.allocationPercentage,
      leave: m.leave ?? [],
    }));

    const calculatedHoursPerDay = finalMembers.reduce(
      (sum, m) => sum + (hoursPerDay * m.allocationPercentage) / 100,
      0,
    );

    if (isEditMode && teamId) {
      updateTeam.mutate(
        {
          id: teamId,
          data: {
            hoursDay: hoursPerDay,
            userIds,
            calculatedHoursPerDay:
              Math.round(calculatedHoursPerDay * 100) / 100,
          },
        },
        {
          onSuccess: () => {
            router.back();
          },
        },
      );
    } else {
      const payload: CreateTeamDTO = {
        projectId,
        sprintId,
        hoursDay: hoursPerDay,
        userIds,
        calculatedHoursPerDay: Math.round(calculatedHoursPerDay * 100) / 100,
      };

      createTeam.mutate(payload, {
        onSuccess: () => {
          router.back();
        },
      });
    }
  }, [
    getMembersWithLeave,
    hoursPerDay,
    isEditMode,
    teamId,
    projectId,
    sprintId,
    updateTeam,
    createTeam,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const isLoading =
    teamsQuery.isLoading || sprintQuery.isLoading || !isInitialized;
  const isSaving = createTeam.isPending || updateTeam.isPending;

  return {
    // Page info
    sprintId,
    sprintName,
    projectId,
    projectName,
    isEditMode,
    isMobile,

    // Sprint dates
    sprint,
    sprintDays,
    dayOffDates,
    showWeekends,
    setShowWeekends,

    // Members
    members,
    filteredMembers,
    memberCount: members.length,

    // Search & Filters
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,

    // Hours per day
    hoursPerDay,
    setHoursPerDay,

    // Add member
    userSearchQuery,
    setUserSearchQuery,
    availableUsers,
    addMember,

    // Member actions
    removeMember,
    updateMemberRole,
    updateMemberAllocation,

    // Leave / Timeline
    hoveredUserId,
    setHoveredUserId,
    setLeave,
    removeLeave,
    getEffectiveLeave,

    // Save
    handleSave,
    handleCancel,

    // Loading state
    isLoading,
    isSaving,
    isUsersLoading: usersQuery.isLoading,
  };
}
