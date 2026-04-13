"use client";
import { useTicketPage } from "../hooks/use-ticket-page";
import { AnimatePresence, motion } from "framer-motion";
import { TicketTable } from "./ticket-table";
import { TicketPageToolbar } from "./ticket-page-toolbar";
import { TicketForm } from "./ticket-form";
import { TicketDeleteModal } from "./ticket-delete-modal";
import { TicketTableSkeleton } from "./ticket-table-skeleton";
import { TicketPageErrorState } from "./ticket-page-error-state";

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
    updateStatusFilter,
    selectedTicketIds,
    onAddTicket,
    onEditTicket,
    onDeleteTicket,
    onSelectionChange,
    onBulkDelete,
    isFormOpen,
    deleteTarget,
    isDeleteLoading,
    handleDeleteConfirm,
    handleCloseDeleteModal,
    refetch,
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
          {isFormOpen ? (
            <div
              key="ticket-form"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-4 pt-1 sm:items-center sm:justify-center sm:pb-6 sm:pt-0"
            >
              <div className="w-full min-w-0 max-w-7xl shrink-0 animate-in fade-in zoom-in duration-300">
                <TicketForm />
              </div>
            </div>
          ) : (
            <motion.div
              key="ticket-table"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={pageTransition}
            >
              {!isLoading && (
                <TicketPageToolbar
                  searchTerm={searchTerm}
                  selectedStatus={selectedStatus}
                  selectedTicketCount={selectedTicketIds.length}
                  isMobile={isMobile}
                  onSearchTermChange={setSearchTerm}
                  onStatusChange={updateStatusFilter}
                  onAddTicket={onAddTicket}
                  onBulkDelete={onBulkDelete}
                />
              )}

              <div className="mt-6 flex flex-1 flex-col overflow-hidden">
                {isLoading ? (
                  <TicketTableSkeleton />
                ) : isError ? (
                  <TicketPageErrorState error={error} onRetry={() => refetch()} />
                ) : (
                  <TicketTable
                    data={tickets}
                    total={total}
                    isMobile={isMobile}
                    onEdit={onEditTicket}
                    onDelete={onDeleteTicket}
                    selectedTicketIds={selectedTicketIds}
                    onSelectionChange={onSelectionChange}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TicketDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        ticketNumber={deleteTarget?.ticketNumber ?? ""}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
