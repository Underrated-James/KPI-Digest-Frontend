"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateTeamDTO, Team } from "../../domain/types/team-types";
import { useTeams } from "./use-teams";
import { useCreateTeam } from "./use-create-team";
import { useUpdateTeam } from "./use-update-team";
import { useDeleteTeam } from "./use-delete-team";
import {
  clearSelectedTeamIds,
  closeDeleteTeamModal,
  closeTeamForm,
  openCreateTeamForm,
  openDeleteTeamModal,
  openEditTeamForm,
  selectDeleteTarget,
  selectEditingTeam,
  selectIsTeamFormOpen,
  selectSelectedTeamIds,
  setSelectedTeamIds,
} from "../store/team-slice";
import { pushTeamsUrl, replaceTeamsUrl } from "../utils/teams-url-state";
import { SprintStatus } from "@/features/sprints/domain/types/sprint-types";

export function useTeamPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const search = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 200);
  const pendingSearchRef = useRef<string | null>(null);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const selectedStatus = searchParams.get("status") as SprintStatus | null;

  const isFormOpen = useAppSelector(selectIsTeamFormOpen);
  const editingTeam = useAppSelector(selectEditingTeam) ?? undefined;
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedTeamIds = useAppSelector(selectSelectedTeamIds);

  useEffect(() => {
    if (pendingSearchRef.current === search) {
      pendingSearchRef.current = null;
    }
  }, [search]);

  useEffect(() => {
    const normalizedSearchTerm = debouncedSearchTerm.trim();

    if (normalizedSearchTerm === search) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (normalizedSearchTerm.length === 0) {
      params.delete("search");
    } else {
      params.set("search", normalizedSearchTerm);
    }

    pendingSearchRef.current = normalizedSearchTerm;
    dispatch(clearSelectedTeamIds());
    replaceTeamsUrl(pathname, params);
  }, [debouncedSearchTerm, dispatch, pathname, search, searchParams]);

  const { data, isLoading, isError, error, refetch } = useTeams({
    page,
    size,
    search: search || undefined,
    status: selectedStatus ?? undefined,
  });
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const teams = data?.content ?? [];

  const updateTeamFilters = (nextStatus: SprintStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (nextStatus === "ALL") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }

    dispatch(clearSelectedTeamIds());
    pushTeamsUrl(pathname, params);
  };

  const handleCreate = (teamData: CreateTeamDTO) => {
    createTeam.mutate(teamData, {
      onSuccess: () => {
        dispatch(closeTeamForm());
      },
    });
  };

  const handleUpdate = (teamData: CreateTeamDTO) => {
    if (!editingTeam) {
      return;
    }

    updateTeam.mutate(
      { id: editingTeam.id, data: teamData },
      {
        onSuccess: () => {
          dispatch(closeTeamForm());
        },
      }
    );
  };

  const handleSubmit = (teamData: CreateTeamDTO) => {
    if (editingTeam) {
      handleUpdate(teamData);
    } else {
      handleCreate(teamData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      deleteTeam.mutate(deleteTarget.id, {
        onSuccess: () => {
          dispatch(closeDeleteTeamModal());
          dispatch(closeTeamForm());
        },
      });
      return;
    }

    if (selectedTeamIds.length === 0) {
      return;
    }

    const totalSelectedTeams = selectedTeamIds.length;

    for (const id of selectedTeamIds) {
      await deleteTeam.mutateAsync(id);
    }

    toast.success(
      totalSelectedTeams === 1
        ? "Team deleted successfully"
        : `${totalSelectedTeams} teams deleted successfully`
    );
    dispatch(clearSelectedTeamIds());
    dispatch(closeDeleteTeamModal());
  };

  const handleEditClick = (team: Team) => {
    dispatch(openEditTeamForm(team));
  };

  const handleDeleteClick = (team: Team) => {
    dispatch(
      openDeleteTeamModal({
        id: team.id,
        name: `${team.projectName ?? "N/A"} - ${team.sprintName ?? "N/A"}`,
      })
    );
  };

  const handleDeleteById = (id: string) => {
    const team = teams.find((item) => item.id === id);

    if (team) {
      handleDeleteClick(team);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedTeamIds.length > 0) {
      dispatch(
        openDeleteTeamModal({
          name: `${selectedTeamIds.length} selected teams`,
        })
      );
    }
  };

  const handleAddClick = () => {
    dispatch(openCreateTeamForm());
  };

  const handleCancel = () => {
    dispatch(closeTeamForm());
  };

  const handleSelectionChange = (ids: string[]) => {
    dispatch(setSelectedTeamIds(ids));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteTeamModal());
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    isMobile,
    isFormOpen,
    editingTeam,
    deleteTarget,
    selectedTeamIds,
    teams,
    totalTeams: data?.totalElements ?? 0,
    hidePagination: false,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting: createTeam.isPending || updateTeam.isPending,
    isDeleteLoading: deleteTeam.isPending,
    handleSubmit,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateTeamFilters,
  };
}
