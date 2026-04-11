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
    editingTeam,
    deleteTarget,
    selectedTeamIds,
    teams,
    totalTeams,
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
    updateTeamFilters,
  } = useTeamPage();
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Teams
            </h1>
          </div>

          {!isFormOpen && !isLoading && (
            <TeamPageToolbar
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
              selectedTeamCount={selectedTeamIds.length}
              isMobile={isMobile}
              onSearchTermChange={setSearchTerm}
              onStatusChange={updateTeamFilters}
              onAddTeam={handleAddClick}
              onBulkDelete={handleBulkDeleteClick}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isFormOpen ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto pb-6">
            <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-300">
              <TeamForm
                initialData={editingTeam}
                onSubmit={handleSubmit}
                onDelete={handleDeleteById}
                isLoading={isSubmitting}
                isDeleting={isDeleteLoading}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : isLoading ? (
          <TeamsTableSkeleton />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {isError ? (
              <TeamPageErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <TeamTable
                data={teams}
                total={totalTeams}
                isMobile={isMobile}
                onEdit={handleEditClick}
                onDelete={handleDeleteById}
                selectedTeamIds={selectedTeamIds}
                onSelectionChange={handleSelectionChange}
                hidePagination={hidePagination}
              />
            )}
          </div>
        )}
      </div>

      <TeamDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        teamName={deleteTarget?.name ?? ""}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
