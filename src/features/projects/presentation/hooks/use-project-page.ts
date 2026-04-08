"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateProjectDTO, Project, ProjectStatus } from "../../domain/types/project-types";
import { useProjects } from "./use-projects";
import { useCreateProject } from "./use-create-project";
import { useUpdateProject } from "./use-update-project";
import { useDeleteProject } from "./use-delete-project";
import {
  clearSelectedProjectIds,
  closeDeleteProjectModal,
  closeProjectForm,
  openCreateProjectForm,
  openDeleteProjectModal,
  openEditProjectForm,
  selectDeleteTarget,
  selectEditingProject,
  selectIsProjectFormOpen,
  selectSelectedProjectIds,
  setSelectedProjectIds,
} from "../store/project-slice";
import { pushProjectsUrl, replaceProjectsUrl } from "../utils/projects-url-state";

export function useProjectPage() {
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
  const selectedStatus = searchParams.get("status") as ProjectStatus | null;

  const isFormOpen = useAppSelector(selectIsProjectFormOpen);
  const editingProject = useAppSelector(selectEditingProject) ?? undefined;
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedProjectIds = useAppSelector(selectSelectedProjectIds);

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
    dispatch(clearSelectedProjectIds());
    replaceProjectsUrl(pathname, params);
  }, [debouncedSearchTerm, dispatch, pathname, search, searchParams]);

  const { data, isLoading, isError, error, refetch } = useProjects({
    page,
    size,
    search: search || undefined,
    status: selectedStatus ?? undefined,
  });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const projects = data?.content ?? [];

  const updateProjectFilters = (nextStatus: ProjectStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (nextStatus === "ALL") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }

    dispatch(clearSelectedProjectIds());
    pushProjectsUrl(pathname, params);
  };

  const handleCreate = (projectData: CreateProjectDTO) => {
    createProject.mutate(projectData, {
      onSuccess: () => {
        dispatch(closeProjectForm());
      },
    });
  };

  const handleUpdate = (projectData: CreateProjectDTO) => {
    if (!editingProject) {
      return;
    }

    updateProject.mutate(
      { id: editingProject.id, data: projectData },
      {
        onSuccess: () => {
          dispatch(closeProjectForm());
        },
      }
    );
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      deleteProject.mutate(deleteTarget.id, {
        onSuccess: () => {
          dispatch(closeDeleteProjectModal());
        },
      });
      return;
    }

    if (selectedProjectIds.length === 0) {
      return;
    }

    const totalSelectedProjects = selectedProjectIds.length;

    for (const id of selectedProjectIds) {
      await deleteProject.mutateAsync(id);
    }

    toast.success(
      totalSelectedProjects === 1
        ? "Project deleted successfully"
        : `${totalSelectedProjects} projects deleted successfully`
    );
    dispatch(clearSelectedProjectIds());
    dispatch(closeDeleteProjectModal());
  };

  const handleEditClick = (project: Project) => {
    dispatch(openEditProjectForm(project));
  };

  const handleDeleteClick = (project: Project) => {
    dispatch(
      openDeleteProjectModal({
        id: project.id,
        name: project.name,
      })
    );
  };

  const handleDeleteById = (id: string) => {
    const project = projects.find((item) => item.id === id);

    if (project) {
      handleDeleteClick(project);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedProjectIds.length > 0) {
      dispatch(
        openDeleteProjectModal({
          name: `${selectedProjectIds.length} selected projects`,
        })
      );
    }
  };

  const handleAddClick = () => {
    dispatch(openCreateProjectForm());
  };

  const handleCancel = () => {
    dispatch(closeProjectForm());
  };

  const handleSelectionChange = (ids: string[]) => {
    dispatch(setSelectedProjectIds(ids));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteProjectModal());
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    isMobile,
    isFormOpen,
    editingProject,
    deleteTarget,
    selectedProjectIds,
    projects,
    totalProjects: data?.totalElements ?? 0,
    hidePagination: false,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting: createProject.isPending || updateProject.isPending,
    isDeleteLoading: deleteProject.isPending,
    handleSubmit: editingProject ? handleUpdate : handleCreate,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateProjectFilters,
  };
}
