"use client";

import { useDeferredValue, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateUserDTO, User, UserRole } from "../../domain/types/user-types";
import { useUsers } from "./use-users";
import { useCreateUser } from "./use-create-user";
import { useUpdateUser } from "./use-update-user";
import { useDeleteUser } from "./use-delete-user";
import {
  clearSelectedUserIds,
  closeDeleteUserModal,
  closeUserForm,
  openCreateUserForm,
  openDeleteUserModal,
  openEditUserForm,
  selectDeleteTarget,
  selectEditingUser,
  selectIsUserFormOpen,
  selectSelectedUserIds,
  setSelectedUserIds,
} from "../store/user-slice";

export function useUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const selectedRole = searchParams.get("role") as UserRole | null;

  const isFormOpen = useAppSelector(selectIsUserFormOpen);
  const editingUser = useAppSelector(selectEditingUser) ?? undefined;
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedUserIds = useAppSelector(selectSelectedUserIds);

  const { data, isLoading, isError, error, refetch } = useUsers({
    page,
    size,
    role: selectedRole ?? undefined,
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();

  const filteredUsers =
    normalizedSearchTerm.length === 0
      ? data?.users ?? []
      : (data?.users ?? []).filter((user) => {
          const searchableText = [user.name, user.email, user.role]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearchTerm);
        });

  const updateUserFilters = (nextRole: UserRole | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (nextRole === "ALL") {
      params.delete("role");
    } else {
      params.set("role", nextRole);
    }

    dispatch(clearSelectedUserIds());
    router.push(
      params.toString() ? `${pathname}?${params.toString()}` : pathname
    );
  };

  const handleCreate = (userData: CreateUserDTO) => {
    createUser.mutate(userData, {
      onSuccess: () => {
        toast.success("User created successfully");
        dispatch(closeUserForm());
      },
    });
  };

  const handleUpdate = (userData: CreateUserDTO) => {
    if (!editingUser) {
      return;
    }

    updateUser.mutate(
      { id: editingUser.id, data: userData },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          dispatch(closeUserForm());
        },
      }
    );
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      deleteUser.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success("User deleted successfully");
          dispatch(closeDeleteUserModal());
        },
      });
      return;
    }

    if (selectedUserIds.length === 0) {
      return;
    }

    const totalSelectedUsers = selectedUserIds.length;

    for (const id of selectedUserIds) {
      await deleteUser.mutateAsync(id);
    }

    toast.success(
      totalSelectedUsers === 1
        ? "User deleted successfully"
        : `${totalSelectedUsers} users deleted successfully`
    );
    dispatch(clearSelectedUserIds());
    dispatch(closeDeleteUserModal());
  };

  const handleEditClick = (user: User) => {
    dispatch(openEditUserForm(user));
  };

  const handleDeleteClick = (user: User) => {
    dispatch(
      openDeleteUserModal({
        id: user.id,
        name: user.name,
      })
    );
  };

  const handleDeleteById = (id: string) => {
    const user = filteredUsers.find((item) => item.id === id);

    if (user) {
      handleDeleteClick(user);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedUserIds.length > 0) {
      dispatch(
        openDeleteUserModal({
          name: `${selectedUserIds.length} selected users`,
        })
      );
    }
  };

  const handleAddClick = () => {
    dispatch(openCreateUserForm());
  };

  const handleCancel = () => {
    dispatch(closeUserForm());
  };

  const handleSelectionChange = (ids: string[]) => {
    dispatch(setSelectedUserIds(ids));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteUserModal());
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedRole,
    isMobile,
    isFormOpen,
    editingUser,
    deleteTarget,
    selectedUserIds,
    filteredUsers,
    totalUsers:
      normalizedSearchTerm.length > 0
        ? filteredUsers.length
        : data?.totalElements ?? 0,
    hidePagination: normalizedSearchTerm.length > 0,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting: createUser.isPending || updateUser.isPending,
    isDeleteLoading: deleteUser.isPending,
    handleSubmit: editingUser ? handleUpdate : handleCreate,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateUserFilters,
  };
}
