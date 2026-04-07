"use client";

import { UserTable } from "./user-table";
import { UserForm } from "./user-form";
import { UserDeleteModal } from "./user-delete-modal";
import { UserPageErrorState } from "./user-page-error-state";
import { UserPageToolbar } from "./user-page-toolbar";
import { UsersTableSkeleton } from "./users-table-skeleton";
import { useUserPage } from "../hooks/use-user-page";

export function UserPage() {
  const {
    searchTerm,
    setSearchTerm,
    selectedRole,
    isMobile,
    isFormOpen,
    editingUser,
    deleteTarget,
    selectedUserIds,
    users,
    totalUsers,
    hidePagination,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting,
    isDeleteLoading,
    handleSubmit,
    handleDeleteConfirm,
    handleEditClick,
    handleDeleteById,
    handleBulkDeleteClick,
    handleAddClick,
    handleCancel,
    handleSelectionChange,
    handleCloseDeleteModal,
    updateUserFilters,
  } = useUserPage();
  

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Users
            </h1>
          </div>

          {!isFormOpen && !isLoading && (
            <UserPageToolbar
              searchTerm={searchTerm}
              selectedRole={selectedRole}
              selectedUserCount={selectedUserIds.length}
              isMobile={isMobile}
              onSearchTermChange={setSearchTerm}
              onRoleChange={updateUserFilters}
              onAddUser={handleAddClick}
              onBulkDelete={handleBulkDeleteClick}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isFormOpen ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto pb-6">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
              <UserForm
                initialData={editingUser}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : isLoading ? (
          <UsersTableSkeleton />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {isError ? (
              <UserPageErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <UserTable
                data={users}
                total={totalUsers}
                isMobile={isMobile}
                onEdit={handleEditClick}
                onDelete={handleDeleteById}
                selectedUserIds={selectedUserIds}
                onSelectionChange={handleSelectionChange}
                hidePagination={hidePagination}
              />
            )}
          </div>
        )}
      </div>

      <UserDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        userName={deleteTarget?.name ?? ""}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
