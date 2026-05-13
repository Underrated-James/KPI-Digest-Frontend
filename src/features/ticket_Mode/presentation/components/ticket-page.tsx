"use client";
import { useTicketPage } from "../hooks/use-ticket-page";
import { AnimatePresence, motion } from "framer-motion";
import { TicketTable } from "./ticket-table";
import { TicketPageToolbar } from "./ticket-page-toolbar";
import { TicketDeleteModal } from "./ticket-delete-modal";
import { TicketViewDialog } from "./ticket-view-dialog";

export default function TicketsPage() {
  const {
    tickets,
    total,
    isLoading,
    isError,
    error,
    isMobile,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    selectedProjectId,
    projectOptions,
    updateStatusFilter,
    updateProjectFilter,
    selectedTicketIds,
    onEditTicket,
    onViewTicket,
    onStatusChange,
    onStartTimer,
    onPauseTimer,
    onCompleteTimer,
    getTimerDisplay,
    onDeleteTicket,
    onSelectionChange,
    onBulkDelete,
    isFormOpen,
    deleteTarget,
    viewTicket,
    isDeleteLoading,
    statusChangePendingTicketId,
    handleDeleteConfirm,
    handleCloseDeleteModal,
    onCloseViewTicket,
  } = useTicketPage();

  const pageTransition = {
    duration: 0.18,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tickets
            </h1>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!isFormOpen ? (
            <motion.div
              key="ticket-table"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={pageTransition}
            >
              <TicketPageToolbar
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                selectedProjectId={selectedProjectId}
                projectOptions={projectOptions}
                selectedTicketCount={selectedTicketIds.length}
                isMobile={isMobile}
                onSearchTermChange={setSearchTerm}
                onStatusChange={updateStatusFilter}
                onProjectChange={updateProjectFilter}
                onBulkDelete={onBulkDelete}
              />

              <div className="mt-6 flex flex-1 flex-col overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
                    Loading ticket mode...
                  </div>
                ) : isError ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm text-destructive">
                    {error?.message ?? "Failed to load ticket mode data."}
                  </div>
                ) : (
                  <TicketTable
                    data={tickets}
                    total={total}
                    isMobile={isMobile}
                    onView={onViewTicket}
                    onStatusChange={onStatusChange}
                    onEdit={onEditTicket}
                    onDelete={onDeleteTicket}
                    onStartTimer={onStartTimer}
                    onPauseTimer={onPauseTimer}
                    onCompleteTimer={onCompleteTimer}
                    getTimerDisplay={getTimerDisplay}
                    selectedTicketIds={selectedTicketIds}
                    onSelectionChange={onSelectionChange}
                    statusChangePendingTicketId={statusChangePendingTicketId}
                  />
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <TicketDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        ticketNumber={deleteTarget?.ticketNumber ?? ""}
        isLoading={isDeleteLoading}
      />
      <TicketViewDialog
        ticket={viewTicket}
        isOpen={Boolean(viewTicket)}
        onClose={onCloseViewTicket}
        timerDisplay={viewTicket ? getTimerDisplay(viewTicket) : "00:00:00"}
      />
    </div>
  );
}
