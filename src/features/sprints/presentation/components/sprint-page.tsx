"use client";

import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SprintTable } from "./sprint-table";
import { SprintForm } from "./sprint-form";
import { SprintDeleteModal } from "./delete-sprint-modal";
import { SprintPageErrorState } from "./sprint-page-error-state";
import { SprintPageToolbar } from "./sprint-page-toolbar";
import { SprintsTableSkeleton } from "./sprint-table-skeleton";
import { SprintProjectPageToolbar } from "./sprint-project-page-toolbar";
import { SprintProjectTable } from "./sprint-project-table";
import { SprintProjectTableSkeleton } from "./sprint-project-table-skeleton";
import { SprintProjectPageErrorState } from "./sprint-project-page-error-state";
import { useSprintPage } from "../hooks/use-sprint-page";

export function SprintPage() {
  const {
    isProjectView,
    selectedProjectId,
    selectedProjectName,
    projectSearchTerm,
    setProjectSearchTerm,
    selectedProjectStatus,
    projects,
    totalProjects,
    sprintSearchTerm,
    setSprintSearchTerm,
    selectedSprintStatus,
    sprints,
    totalSprints,
    isMobile,
    isFormOpen,
    editingSprint,
    deleteTarget,
    selectedSprintIds,
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
    updateSprintFilters,
    handleOpenProject,
    handleBackToProjects,
  } = useSprintPage();

  const projectTitle = selectedProjectName || selectedProjectId || "Selected Project";

  const panelTransition = {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {isProjectView ? null : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToProjects}
                  className="h-9 gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {isProjectView ? "Sprints" : `Sprints - ${projectTitle}`}
              </h1>
            </div>
          </div>

          {!isFormOpen &&
            !isLoading &&
            (isProjectView ? (
              <SprintProjectPageToolbar
                searchTerm={projectSearchTerm}
                selectedStatus={selectedProjectStatus}
                isMobile={isMobile}
                onSearchTermChange={setProjectSearchTerm}
                onStatusChange={updateProjectFilters}
              />
            ) : (
              <SprintPageToolbar
                searchTerm={sprintSearchTerm}
                selectedStatus={selectedSprintStatus}
                selectedSprintCount={selectedSprintIds.length}
                isMobile={isMobile}
                onSearchTermChange={setSprintSearchTerm}
                onStatusChange={updateSprintFilters}
                onAddSprint={handleAddClick}
                onBulkDelete={handleBulkDeleteClick}
              />
            ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isProjectView ? (
            <motion.div
              key="project-list"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={panelTransition}
            >
              {isLoading ? (
                <SprintProjectTableSkeleton />
              ) : isError ? (
                <SprintProjectPageErrorState
                  error={error}
                  onRetry={() => refetch()}
                />
              ) : (
                <SprintProjectTable
                  data={projects}
                  total={totalProjects}
                  onProjectSelect={handleOpenProject}
                />
              )}
            </motion.div>
          ) : isFormOpen ? (
            <motion.div
              key="sprint-form"
              className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto pb-6"
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.99 }}
              transition={panelTransition}
            >
              <div className="w-full max-w-7xl">
                <SprintForm
                  initialData={editingSprint}
                  defaultProjectId={selectedProjectId ?? undefined}
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                  onCancel={handleCancel}
                />
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="sprint-table-skeleton"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={panelTransition}
            >
              <SprintsTableSkeleton />
            </motion.div>
          ) : isError ? (
            <motion.div
              key="sprint-error"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={panelTransition}
            >
              <SprintPageErrorState error={error} onRetry={() => refetch()} />
            </motion.div>
          ) : (
            <motion.div
              key="sprint-table"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={panelTransition}
            >
              <SprintTable
                data={sprints}
                total={totalSprints}
                isMobile={isMobile}
                onEdit={handleEditClick}
                onDelete={handleDeleteById}
                selectedSprintIds={selectedSprintIds}
                onSelectionChange={handleSelectionChange}
                hidePagination={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isProjectView ? (
        <SprintDeleteModal
          isOpen={Boolean(deleteTarget)}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          sprintName={deleteTarget?.name ?? ""}
          isLoading={isDeleteLoading}
        />
      ) : null}
    </div>
  );
}
