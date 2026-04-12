"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import {
  closeDeleteTicketModal,
  selectDeleteTarget,
} from "../store/ticket-slice";
import { useDeleteTicket } from "../hooks/use-delete-ticket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TicketDeleteModal() {
  const dispatch = useAppDispatch();
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const { mutate: deleteTicket, isPending } = useDeleteTicket();

  const handleClose = () => {
    dispatch(closeDeleteTicketModal());
  };

  const handleConfirm = () => {
    if (deleteTarget?.id) {
      deleteTicket(deleteTarget.id, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  };

  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ticket{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.ticketNumber}
            </span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
