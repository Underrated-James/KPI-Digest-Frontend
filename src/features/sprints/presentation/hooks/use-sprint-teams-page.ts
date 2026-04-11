"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { useCreateTeam } from "@/features/teams/presentation/hooks/use-create-team";
import { useUpdateTeam } from "@/features/teams/presentation/hooks/use-update-team";
import { teamService } from "@/features/teams/infrastructure/team-service";
import { teamKeys } from "@/features/teams/presentation/queries/team-keys";
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

import { useDeleteTeam } from "@/features/teams/presentation/hooks/use-delete-team";

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

function serializeTeamMembers(members: SprintTeamMember[]): string {
  return JSON.stringify(
    members
      .map((member) => ({
        userId: member.userId,
        role: member.role,
        allocationPercentage: member.allocationPercentage,
        leave: (member.leave ?? [])
          .map((leave) => ({
            leaveDate: normalizeDate(leave.leaveDate),
            leaveType: [...leave.leaveType].sort(),
          }))
          .sort((a, b) => a.leaveDate.localeCompare(b.leaveDate)),
      }))
      .sort((a, b) => a.userId.localeCompare(b.userId)),
  );
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
  const teamIdFromUrl = searchParams.get("teamId") ?? "";

  // Fetch the sprint to get startDate, endDate, dayOffs
  const sprintQuery = useQuery({
    queryKey: sprintKeys.detail(sprintId),
    queryFn: () => sprintService.getSprintById.execute(sprintId),
    enabled: Boolean(sprintId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const sprint = sprintQuery.data ?? null;

  // Fetch existing team for this sprint
  // Use a smaller size and specific sprintId filter
  const teamsQuery = useTeams({ 
    sprintId, 
    page: 1, 
    size: 10 // realistic size instead of 1000
  });
  
  const teamByIdQuery = useQuery({
    queryKey: teamKeys.detail(teamIdFromUrl),
    queryFn: () => teamService.getTeamById.execute(teamIdFromUrl),
    enabled: Boolean(teamIdFromUrl),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const existingTeam =
    (teamIdFromUrl && teamByIdQuery.data) ||
    teamsQuery.data?.content?.find((team) => team.sprintId === sprintId) ||
    null;

  const isEditMode = Boolean(existingTeam);
  const teamId = existingTeam?.id ?? null;

  // Fetch users for Add Member dropdown
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  // Use a single user query and filter locally
  // Increased staleTime to prevent redundant fetches
  const usersQuery = useUsers({ size: 100 });
  const allUsers = useMemo(
    () => usersQuery.data?.users ?? [],
    [usersQuery.data?.users],
  );

  const normalizedUserSearch = userSearchQuery.trim().toLowerCase();
  
  // Local filtering instead of multiple API calls (Eliminates role=DEVS and role=QA calls)
  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (normalizedUserSearch) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(normalizedUserSearch) || 
        u.email?.toLowerCase().includes(normalizedUserSearch)
      );
    }
    return result;
  }, [allUsers, normalizedUserSearch]);
  
  const [members, setMembers] = useState<SprintTeamMember[]>([]);

  const availableUsers = useMemo(() => {
    const currentMemberIds = new Set(members.map((m) => m.userId));
    return filteredUsers.filter((u) => !currentMemberIds.has(u.id));
  }, [filteredUsers, members]);

  const userLookup = useMemo(
    () => new Map(allUsers.map((user) => [user.id, user] as const)),
    [allUsers],
  );

  // Mutations
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  // Local state
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "DEVS" | "QA">("ALL");
  const [showWeekends, setShowWeekends] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [initialTeamSnapshot, setInitialTeamSnapshot] = useState<string | null>(
    null,
  );

  // Leave overrides: key = `${userId}:${date}`, value = LeaveType or null (removed)
  const [leaveOverrides, setLeaveOverrides] = useState<
    Record<string, LeaveType | null>
  >({});
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  // Populate members from existing team on first load
  useEffect(() => {
    if (isInitialized) return;
    if (teamsQuery.isLoading) return;
    if (teamIdFromUrl && teamByIdQuery.isLoading) return;
    if (existingTeam && usersQuery.isLoading) return;

    const timer = setTimeout(() => {
      if (existingTeam) {
        const teamUsers = Array.isArray(existingTeam.users)
          ? existingTeam.users
          : [];

        const mapped: SprintTeamMember[] = teamUsers.map((u) => ({
          userId: u.userId,
          name: userLookup.get(u.userId)?.name ?? u.userId,
          role:
            (u.role as "DEVS" | "QA" | undefined) ??
            (userLookup.get(u.userId)?.role === "QA" ? "QA" : "DEVS"),
          allocationPercentage: u.allocationPercentage ?? 100,
          leave: u.leave ?? [],
        }));
        setInitialTeamSnapshot(serializeTeamMembers(mapped));
        setMembers(mapped);
      }

      setIsInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [
    existingTeam,
    teamByIdQuery.isLoading,
    teamIdFromUrl,
    teamsQuery.isLoading,
    usersQuery.isLoading,
    isInitialized,
    userLookup,
  ]);

  // ─── Timeline data ────────────────────────────────────────

  const sprintDays = useMemo(() => {
    if (!sprint) return [];
    const allDays = getSprintDays(sprint.startDate, sprint.endDate);
    return showWeekends ? allDays : allDays.filter((d) => !isWeekend(d));
  }, [sprint, showWeekends]);

  const dayOffDates = useMemo(() => {
    if (!sprint?.dayOff) return [];
    return sprint.dayOff.map((d: DayOff) => normalizeDate(d.date));
  }, [sprint]);

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
        (m.leave ?? []).map((l) => [normalizeDate(l.leaveDate), l]),
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

  const currentTeamSnapshot = useMemo(
    () => serializeTeamMembers(getMembersWithLeave()),
    [getMembersWithLeave],
  );

  const isDirty = useMemo(() => {
    if (!isEditMode) {
      return members.length > 0;
    }

    if (!initialTeamSnapshot) {
      return false;
    }

    return currentTeamSnapshot !== initialTeamSnapshot;
  }, [currentTeamSnapshot, initialTeamSnapshot, isEditMode, members.length]);

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
    if (isEditMode && !isDirty) {
      toast.error("No changes to update");
      return;
    }

    const finalMembers = getMembersWithLeave();

    if (finalMembers.length === 0) {
      toast.error("Please add at least one team member");
      return;
    }

    const sprintHoursPerDay = sprint?.workingHoursDay ?? 0;
    if (sprintHoursPerDay <= 0) {
      toast.error("Sprint working hours are not available");
      return;
    }

    const userIds: ListOfUsers[] = finalMembers.map((m) => {
      const hoursPerDay =
        Math.round(((sprintHoursPerDay * m.allocationPercentage) / 100) * 10) /
        10;

      return {
        userId: m.userId,
        role: m.role,
        allocationPercentage: m.allocationPercentage,
        hoursPerDay,
        leave: m.leave ?? [],
      };
    });

    if (isEditMode && teamId) {
      updateTeam.mutate(
        {
          id: teamId,
          data: {
            userIds,
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
        userIds,
      };

      createTeam.mutate(payload, {
        onSuccess: () => {
          router.back();
        },
      });
    }
  }, [
    getMembersWithLeave,
    isEditMode,
    teamId,
    projectId,
    sprintId,
    sprint?.workingHoursDay,
    isDirty,
    updateTeam,
    createTeam,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(() => {
    if (!teamId) return;
    setIsDeleteModalOpen(true);
  }, [teamId]);

  const handleDeleteConfirm = useCallback(() => {
    if (!teamId) return;
    
    deleteTeam.mutate(teamId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        router.back();
      },
    });
  }, [teamId, deleteTeam, router]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const isLoading =
    teamsQuery.isLoading ||
    teamByIdQuery.isLoading ||
    sprintQuery.isLoading ||
    usersQuery.isLoading ||
    !isInitialized;
  const isSaving = createTeam.isPending || updateTeam.isPending;
  const isUsersLoading = usersQuery.isFetching;

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

    // Add member
    userSearchQuery,
    setUserSearchQuery,
    availableUsers,
    addMember,

    // Member actions
    removeMember,
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
    handleDelete,
    handleDeleteConfirm,
    closeDeleteModal,
    isDeleteModalOpen,
    isDirty,

    // Loading state
    isLoading,
    isSaving,
    isDeleting: deleteTeam.isPending,
    isUsersLoading,
  };
}
