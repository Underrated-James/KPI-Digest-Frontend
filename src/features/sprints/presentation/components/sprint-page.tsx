"use client";

import { SprintTable } from "./sprint-table";
import { SprintForm } from "./sprint-form";
import { SprintDeleteModal } from "./delete-sprint-modal";
import { SprintPageErrorState } from "./sprint-page-error-state";
import { SprintPageToolbar } from "./sprint-page-toolbar";
import { SprintsTableSkeleton } from "./sprint-table-skeleton";
import { useSprintPage } from "../hooks/use-sprint-page";

export function SprintPage() {
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    isMobile,
    isFormOpen,
    editingSprint,
    deleteTarget,
    selectedSprintIds,
    sprints,
    totalSprints,
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
    updateSprintFilters,
  } = useSprintPage();
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sprints
            </h1>
          </div>

          {!isFormOpen && !isLoading && (
            <SprintPageToolbar
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
              selectedSprintCount={selectedSprintIds.length}
              isMobile={isMobile}
              onSearchTermChange={setSearchTerm}
              onStatusChange={updateSprintFilters}
              onAddSprint={handleAddClick}
              onBulkDelete={handleBulkDeleteClick}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isFormOpen ? (
          <div className="flex flex-1 items-start justify-center overflow-y-auto pb-6 pt-2">
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
              <SprintForm
                initialData={editingSprint}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : isLoading ? (
          <SprintsTableSkeleton />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {isError ? (
              <SprintPageErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <SprintTable
                data={sprints}
                total={totalSprints}
                isMobile={isMobile}
                onEdit={handleEditClick}
                onDelete={handleDeleteById}
                selectedSprintIds={selectedSprintIds}
                onSelectionChange={handleSelectionChange}
                hidePagination={hidePagination}
              />
            )}
          </div>
        )}
      </div>

      <SprintDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        sprintName={deleteTarget?.name ?? ""}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
