"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ticket } from "../../domain/types/ticket-types";
import { ticketStatusLabel } from "../utils/ticket-status-ui";

interface TicketViewDialogProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  timerDisplay: string;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="rounded-md border border-input bg-muted/40 px-3 py-2.5 text-sm text-foreground">
        {value || "-"}
      </div>
    </div>
  );
}

export function TicketViewDialog({
  ticket,
  isOpen,
  onClose,
  timerDisplay,
}: TicketViewDialogProps) {
  if (!ticket) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[96vh] max-w-7xl overflow-hidden border-none bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">
          View ticket {ticket.ticketNumber}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Read-only ticket details dialog.
        </DialogDescription>
        <Card className="mx-auto flex h-full min-h-0 w-full max-w-7xl max-h-[calc(100dvh-1rem)] flex-col border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-h-[calc(100vh-2rem)]">
          <CardHeader className="shrink-0 border-b border-border/80 px-4 pb-3 pt-4 text-center sm:px-6 sm:pb-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl">View Ticket</CardTitle>
            <CardDescription className="text-pretty text-sm">
              Review ticket details, ownership, estimates, and timer activity.
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.9fr)] xl:gap-6">
                <section className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Core Details
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ticket identity, project context, and linked source.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Project"
                      value={ticket.projectName || "-"}
                    />
                    <ReadOnlyField
                      label="Ticket Number"
                      value={ticket.ticketNumber}
                    />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        Status
                      </div>
                      <div className="flex min-h-10 items-center rounded-md border border-input bg-muted/40 px-3 py-2.5">
                        <Badge variant="secondary" className="text-xs">
                          {ticketStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <ReadOnlyField
                      label="Ticket Title"
                      value={ticket.ticketTitle}
                    />
                    <ReadOnlyField
                      label="Description Link"
                      value={ticket.descriptionLink || "-"}
                    />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        Description
                      </div>
                      <div className="min-h-[280px] rounded-md border border-input bg-muted/40 px-4 py-3 text-sm leading-6 text-foreground whitespace-pre-wrap">
                        {ticket.description?.trim() ||
                          "No description provided."}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground">
                        Assignments
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ownership and current timer state.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                      <ReadOnlyField
                        label="Assigned Developer"
                        value={ticket.assignedDevName || "Unassigned"}
                      />
                      <ReadOnlyField
                        label="Assigned By"
                        value={ticket.assignedQaName || "Unassigned"}
                      />
                      <ReadOnlyField label="Timer" value={timerDisplay} />
                      <ReadOnlyField
                        label="Completed Timestamp"
                        value={ticket.completedAt || "-"}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground">
                        Timeline
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Timestamps recorded for this ticket.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                      <ReadOnlyField
                        label="Created At"
                        value={ticket.createdAt || "-"}
                      />
                      <ReadOnlyField
                        label="Updated At"
                        value={ticket.updatedAt || "-"}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>

          <CardFooter className="shrink-0 border-t border-border/80 bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex w-full justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
