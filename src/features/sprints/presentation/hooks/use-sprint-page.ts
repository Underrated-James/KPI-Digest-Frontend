"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CreateSprintDTO,
  Sprint,
  SprintStatus,
} from "../../domain/types/sprint-types";
import { useSprints } from "./use-sprints";
import { useCreateSprint } from "./use-create-sprint";
import { useUpdateSprint } from "./use-update-sprint";
import { useDeleteSprint } from "./use-delete-sprint";
import {
  clearSelectedSprintIds,
  closeDeleteSprintModal,
  closeSprintForm,
  openCreateSprintForm,
  openDeleteSprintModal,
  openEditSprintForm,
  selectDeleteTarget,
  selectEditingSprint,
  selectIsSprintFormOpen,
  selectSelectedSprintIds,
  setSelectedSprintIds,
} from "../store/sprint-slice";
import { pushSprintsUrl, replaceSprintsUrl } from "../utils/sprint-url-state";
import { useProjects } from "@/features/projects/presentation/hooks/use-projects";
import { Project, ProjectStatus } from "@/features/projects/domain/types/project-types";
import { useProjectById } from "@/features/projects/presentation/hooks/use-project-by-id";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";

export function useSprintPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const selectedProjectId = searchParams.get("projectId");
  const selectedProjectNameFromUrl = searchParams.get("projectName") ?? "";
  const isSprintView = Boolean(selectedProjectId);

  const projectSearch = searchParams.get("projectSearch") ?? "";
  const [projectSearchTerm, setProjectSearchTerm] = useState(projectSearch);
  const debouncedProjectSearchTerm = useDebouncedValue(projectSearchTerm, 200);

  const sprintSearch = searchParams.get("sprintSearch") ?? "";
  const [sprintSearchTerm, setSprintSearchTerm] = useState(sprintSearch);
  const debouncedSprintSearchTerm = useDebouncedValue(sprintSearchTerm, 200);

  const projectPage = Number(searchParams.get("projectPage")) || 1;
  const projectSize = Number(searchParams.get("projectSize")) || 10;
  const selectedProjectStatus = searchParams.get("projectStatus") as
    | ProjectStatus
    | null;

  const sprintPage = Number(searchParams.get("sprintPage")) || 1;
  const sprintSize = Number(searchParams.get("sprintSize")) || 10;
  const selectedSprintStatus = searchParams.get("sprintStatus") as
    | SprintStatus
    | null;

  const isFormOpen = useAppSelector(selectIsSprintFormOpen);
  const editingSprint = useAppSelector(selectEditingSprint) ?? undefined;
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedSprintIds = useAppSelector(selectSelectedSprintIds);

  const projectsQuery = useProjects(
    {
      page: projectPage,
      size: projectSize,
      search: projectSearch || undefined,
      status: selectedProjectStatus ?? undefined,
    },
    !isSprintView,
  );

  const sprintQuery = useSprints(
    {
      page: sprintPage,
      size: sprintSize,
      search: sprintSearch || undefined,
      status: selectedSprintStatus ?? undefined,
      projectId: selectedProjectId ?? undefined,
    },
    isSprintView,
  );

  const projectDetailQuery = useProjectById(selectedProjectId);
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();

  // Fetch teams for current project to build sprint→team lookup
  const teamsForProject = useTeams(
    selectedProjectId ? { projectId: selectedProjectId, size: 100 } : undefined,
  );

  const teamSprintMap = useMemo(() => {
    const map = new Map<string, string>();
    const teams = teamsForProject.data?.content ?? [];
    for (const team of teams) {
      map.set(team.sprintId, team.id);
    }
    return map;
  }, [teamsForProject.data?.content]);

  useEffect(() => {
    setProjectSearchTerm(projectSearch);
  }, [projectSearch]);

  useEffect(() => {
    setSprintSearchTerm(sprintSearch);
  }, [sprintSearch]);

  useEffect(() => {
    if (isSprintView) {
      return;
    }

    const normalizedProjectSearch = debouncedProjectSearchTerm.trim();

    if (normalizedProjectSearch === projectSearch) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("projectPage", "1");

    if (normalizedProjectSearch.length === 0) {
      params.delete("projectSearch");
    } else {
      params.set("projectSearch", normalizedProjectSearch);
    }

    replaceSprintsUrl(pathname, params);
  }, [debouncedProjectSearchTerm, isSprintView, pathname, projectSearch, searchParams]);

  useEffect(() => {
    if (!isSprintView) {
      return;
    }

    const normalizedSprintSearch = debouncedSprintSearchTerm.trim();

    if (normalizedSprintSearch === sprintSearch) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("sprintPage", "1");

    if (normalizedSprintSearch.length === 0) {
      params.delete("sprintSearch");
    } else {
      params.set("sprintSearch", normalizedSprintSearch);
    }

    replaceSprintsUrl(pathname, params);
  }, [debouncedSprintSearchTerm, isSprintView, pathname, searchParams, sprintSearch]);

  useEffect(() => {
    dispatch(clearSelectedSprintIds());
    dispatch(closeDeleteSprintModal());
    dispatch(closeSprintForm());
  }, [dispatch, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || searchParams.get("createSprint") !== "1") {
      return;
    }
    dispatch(openCreateSprintForm());
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createSprint");
    replaceSprintsUrl(pathname, params);
  }, [dispatch, pathname, searchParams, selectedProjectId]);

  const handleOpenProject = (project: Project) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("projectId", project.id);
    params.set("projectName", project.name);
    params.set("sprintPage", "1");
    params.delete("sprintSearch");
    params.delete("sprintStatus");
    dispatch(clearSelectedSprintIds());
    dispatch(closeDeleteSprintModal());
    if (isFormOpen) {
      dispatch(closeSprintForm());
    }
    pushSprintsUrl(pathname, params);
  };

  const handleBackToProjects = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("projectId");
    params.delete("projectName");
    dispatch(clearSelectedSprintIds());
    dispatch(closeDeleteSprintModal());
    if (isFormOpen) {
      dispatch(closeSprintForm());
    }
    pushSprintsUrl(pathname, params);
  };

  const updateProjectFilters = (nextStatus: ProjectStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectPage", "1");

    if (nextStatus === "ALL") {
      params.delete("projectStatus");
    } else {
      params.set("projectStatus", nextStatus);
    }

    dispatch(clearSelectedSprintIds());
    pushSprintsUrl(pathname, params);
  };

  const updateSprintFilters = (nextStatus: SprintStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sprintPage", "1");

    if (nextStatus === "ALL") {
      params.delete("sprintStatus");
    } else {
      params.set("sprintStatus", nextStatus);
    }

    dispatch(clearSelectedSprintIds());
    pushSprintsUrl(pathname, params);
  };

  const handleCreate = (sprintData: CreateSprintDTO) => {
    createSprint.mutate(sprintData, {
      onSuccess: () => {
        dispatch(closeSprintForm());
      },
    });
  };

  const handleUpdate = (sprintData: CreateSprintDTO) => {
    if (!editingSprint) {
      return;
    }

    updateSprint.mutate(
      { id: editingSprint.id, data: sprintData },
      {
        onSuccess: () => {
          dispatch(closeSprintForm());
        },
      },
    );
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      deleteSprint.mutate(deleteTarget.id, {
        onSuccess: () => {
          dispatch(closeDeleteSprintModal());
        },
      });
      return;
    }

    if (selectedSprintIds.length === 0) {
      return;
    }

    const totalSelectedSprints = selectedSprintIds.length;

    for (const id of selectedSprintIds) {
      await deleteSprint.mutateAsync(id);
    }

    toast.success(
      totalSelectedSprints === 1
        ? "Sprint deleted successfully"
        : `${totalSelectedSprints} sprints deleted successfully`,
    );
    dispatch(clearSelectedSprintIds());
    dispatch(closeDeleteSprintModal());
  };

  const handleEditClick = (sprint: Sprint) => {
    dispatch(openEditSprintForm(sprint));
  };

  const handleCreateTeamsClick = (sprint: Sprint) => {
    const params = new URLSearchParams();
    params.set("sprintName", sprint.name);
    if (selectedProjectId) params.set("projectId", selectedProjectId);
    if (activeProjectName) params.set("projectName", activeProjectName);

    const teamId = teamSprintMap.get(sprint.id);
    if (teamId) {
      params.set("teamId", teamId);
    }

    router.push(
      `/sprints/${sprint.id}/create-teams?${params.toString()}`,
    );
  };

  const handleCapacityPlanningClick = (sprint: Sprint) => {
    const params = new URLSearchParams();
    if (selectedProjectId) params.set("projectId", selectedProjectId);
    if (activeProjectName) params.set("projectName", activeProjectName);
    router.push(`/sprints/${sprint.id}/capacity-planning?${params.toString()}`);
  };

  const handleDeleteClick = (sprint: Sprint) => {
    dispatch(
      openDeleteSprintModal({
        id: sprint.id,
        name: sprint.name,
      }),
    );
  };

  const handleDeleteById = (id: string) => {
    const sprint = sprints.find((item) => item.id === id);

    if (sprint) {
      handleDeleteClick(sprint);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedSprintIds.length > 0) {
      dispatch(
        openDeleteSprintModal({
          name: `${selectedSprintIds.length} selected sprints`,
        }),
      );
    }
  };

  const handleAddClick = () => {
    dispatch(openCreateSprintForm());
  };

  const handleCancel = () => {
    dispatch(closeSprintForm());
  };

  const handleSelectionChange = (ids: string[]) => {
    dispatch(setSelectedSprintIds(ids));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteSprintModal());
  };

  const projects = projectsQuery.data?.content ?? [];
  const sprints = sprintQuery.data?.content ?? [];

  const activeProjectName =
    projectDetailQuery.data?.name ?? selectedProjectNameFromUrl;

  const isLoading = isSprintView ? sprintQuery.isLoading : projectsQuery.isLoading;
  const isError = isSprintView ? sprintQuery.isError : projectsQuery.isError;
  const error = isSprintView ? sprintQuery.error : projectsQuery.error;
  const refetch = isSprintView ? sprintQuery.refetch : projectsQuery.refetch;

  return {
    isProjectView: !isSprintView,
    isSprintView,
    selectedProjectId,
    selectedProjectName: activeProjectName,
    projectSearchTerm,
    setProjectSearchTerm,
    selectedProjectStatus,
    projectPage,
    projectSize,
    projects,
    totalProjects: projectsQuery.data?.totalElements ?? 0,
    sprintSearchTerm,
    setSprintSearchTerm,
    selectedSprintStatus,
    sprintPage,
    sprintSize,
    sprints,
    totalSprints: sprintQuery.data?.totalElements ?? 0,
    isMobile,
    isFormOpen,
    editingSprint,
    deleteTarget,
    selectedSprintIds,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting: createSprint.isPending || updateSprint.isPending,
    isDeleteLoading: deleteSprint.isPending,
    handleOpenProject,
    handleBackToProjects,
    handleCreateTeamsClick,
    handleCapacityPlanningClick,
    handleSubmit: editingSprint ? handleUpdate : handleCreate,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateProjectFilters,
    updateSprintFilters,
    teamSprintMap,
  };
}
