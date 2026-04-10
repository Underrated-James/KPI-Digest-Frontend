"use client";

import { TeamTable } from "./team-table";
import { TeamForm } from "./team-form";
import { TeamDeleteModal } from "./team-delete-modal";
import { TeamPageErrorState } from "./team-page-error-state";
import { TeamPageToolbar } from "./team-page-toolbar";
import { TeamsTableSkeleton } from "./team-table-skeleton";
import { useTeamPage } from "../hooks/use-team-page";

export function TeamPage() {
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    isMobile,
    isFormOpen,
    editingProject,
    deleteTarget,
    selectedProjectIds,
    projects,
    totalProjects,
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
    updateProjectFilters,
  } = useProjectPage();
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Projects
            </h1>
          </div>

          {!isFormOpen && !isLoading && (
            <ProjectPageToolbar
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
              selectedProjectCount={selectedProjectIds.length}
              isMobile={isMobile}
              onSearchTermChange={setSearchTerm}
              onStatusChange={updateProjectFilters}
              onAddProject={handleAddClick}
              onBulkDelete={handleBulkDeleteClick}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isFormOpen ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto pb-6">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
              <ProjectForm
                initialData={editingProject}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : isLoading ? (
          <ProjectsTableSkeleton />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {isError ? (
              <ProjectPageErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <ProjectTable
                data={projects}
                total={totalProjects}
                isMobile={isMobile}
                onEdit={handleEditClick}
                onDelete={handleDeleteById}
                selectedProjectIds={selectedProjectIds}
                onSelectionChange={handleSelectionChange}
                hidePagination={hidePagination}
              />
            )}
          </div>
        )}
      </div>

      <ProjectDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        projectName={deleteTarget?.name ?? ""}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
