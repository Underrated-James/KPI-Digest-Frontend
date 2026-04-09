"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateSprintDTO, Sprint, SprintStatus } from "../../domain/types/sprint-types";
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

export function useSprintPage() {
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

  const isFormOpen = useAppSelector(selectIsSprintFormOpen);
  const editingSprint = useAppSelector(selectEditingSprint) ?? undefined;
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedSprintIds = useAppSelector(selectSelectedSprintIds);

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
    dispatch(clearSelectedSprintIds());
    replaceSprintsUrl(pathname, params);
  }, [debouncedSearchTerm, dispatch, pathname, search, searchParams]);

  const { data, isLoading, isError, error, refetch } = useSprints({
    page,
    size,
    search: search || undefined,
    status: selectedStatus ?? undefined,
  });
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();
  const sprints = data?.content ?? [];

  const updateSprintFilters = (nextStatus: SprintStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (nextStatus === "ALL") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
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
      }
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
        : `${totalSelectedSprints} sprints deleted successfully`
    );
    dispatch(clearSelectedSprintIds());
    dispatch(closeDeleteSprintModal());
  };

  const handleEditClick = (sprint: Sprint) => {
    dispatch(openEditSprintForm(sprint));
  };

  const handleDeleteClick = (sprint: Sprint) => {
    dispatch(
      openDeleteSprintModal({
        id: sprint.id,
        name: sprint.name,
      })
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
        })
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

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    isMobile,
    isFormOpen,
    editingSprint,
    deleteTarget,
    selectedSprintIds,
    sprints,
    totalSprints: data?.totalElements ?? 0,
    hidePagination: false,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting: createSprint.isPending || updateSprint.isPending,
    isDeleteLoading: deleteSprint.isPending,
    handleSubmit: editingSprint ? handleUpdate : handleCreate,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateSprintFilters,
  };
}
