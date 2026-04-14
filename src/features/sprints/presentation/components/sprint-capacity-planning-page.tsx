"use client";

import { ArrowLeft, Plus, Save, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSprintCapacityPlanning } from "../hooks/use-sprint-capacity-planning";

interface SprintCapacityPlanningPageProps {
  sprintId: string;
}

function utilizationColor(utilization: number) {
  if (utilization > 100) return "bg-destructive";
  if (utilization >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function statusLabel(status?: string) {
  if (!status) return "N/A";
  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}

export function SprintCapacityPlanningPage({
  sprintId,
}: SprintCapacityPlanningPageProps) {
  const {
    sprint,
    team,
    members,
    devMembers,
    qaMembers,
    tickets,
    isLoading,
    isSaving,
    totalSprintCapacity,
    totalCommitted,
    totalAvailable,
    hasOverCapacity,
    isAddModalOpen,
    setIsAddModalOpen,
    ticketSearch,
    setTicketSearch,
    ticketSearchResults,
    ticketSearchLoading,
    ticketSearchError,
    ticketSearchPage,
    hasMoreSearchResults,
    loadMoreSearchResults,
    addTicket,
    isTicketAlreadyAdded,
    updateTicket,
    removeTicket,
    goBackToSprintList,
    save,
  } = useSprintCapacityPlanning(sprintId);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading sprint capacity planner...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goBackToSprintList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sprint Capacity Planner
            </h1>
            <p className="text-sm text-muted-foreground">
              {sprint?.name ?? "Sprint"}{" "}
              {sprint?.projectName ? `- ${sprint.projectName}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket
          </Button>
          <Button
            onClick={save}
            disabled={isSaving || hasOverCapacity}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Bulk Update"}
          </Button>
        </div>
      </div>

      {!team ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          No team exists for this sprint yet. You can still add tickets to the
          sprint now and leave assignees and estimations empty until planning is
          ready.
        </div>
      ) : null}

      {hasOverCapacity ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Over capacity: one or more members have committed hours exceeding
          available capacity.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sprint Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalSprintCapacity}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Committed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalCommitted}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAvailable}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{members.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left">Member</th>
                  <th className="px-2 py-2 text-left">Sprint Capacity</th>
                  <th className="px-2 py-2 text-left">Committed</th>
                  <th className="px-2 py-2 text-left">Available</th>
                  <th className="px-2 py-2 text-left">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId} className="border-b">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        <Badge
                          variant={
                            member.role === "QA" ? "secondary" : "default"
                          }
                        >
                          {member.role}
                        </Badge>
                        {member.isZeroCapacity ? (
                          <Badge variant="destructive" className="ml-1">
                            0 capacity
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-2">{member.sprintCapacity}h</td>
                    <td className="px-2 py-2">{member.committed}h</td>
                    <td
                      className={`px-2 py-2 ${member.available < 0 ? "text-destructive" : ""}`}
                    >
                      {member.available}h
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-40 overflow-hidden rounded bg-muted">
                          <div
                            className={`h-2 ${utilizationColor(member.utilization)}`}
                            style={{
                              width: `${Math.min(member.utilization, 100)}%`,
                            }}
                          />
                        </div>
                        <span>{member.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-0">
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left">Ticket ID</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Assigned Dev</th>
                  <th className="px-2 py-2 text-left">Assigned QA</th>
                  <th className="px-2 py-2 text-left">Dev Estimation</th>
                  <th className="px-2 py-2 text-left">QA Estimation</th>
                  <th className="px-2 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-2 py-8 text-center text-muted-foreground"
                    >
                      No tickets yet. Use Add Ticket to start planning.
                    </td>
                  </tr>
                ) : null}
                {tickets.map((ticket) => (
                  <tr key={ticket.ticketId} className="border-b">
                    <td className="px-2 py-2 font-medium">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-2 py-2">{ticket.title}</td>
                    <td className="px-2 py-2">{statusLabel(ticket.status)}</td>
                    <td className="px-2 py-2">
                      <select
                        className="h-9 w-full rounded border border-border bg-background px-2"
                        value={ticket.assignedDevId ?? ""}
                        onChange={(event) =>
                          updateTicket(ticket.ticketId, {
                            assignedDevId: event.target.value || null,
                          })
                        }
                      >
                        <option value="">Unassigned</option>
                        {devMembers.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="h-9 w-full rounded border border-border bg-background px-2"
                        value={ticket.assignedQaId ?? ""}
                        onChange={(event) =>
                          updateTicket(ticket.ticketId, {
                            assignedQaId: event.target.value || null,
                          })
                        }
                      >
                        <option value="">Unassigned</option>
                        {qaMembers.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        min={0}
                        type="number"
                        value={ticket.developmentEstimation}
                        onChange={(event) =>
                          updateTicket(ticket.ticketId, {
                            developmentEstimation: Number(
                              event.target.value || 0,
                            ),
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        min={0}
                        type="number"
                        value={ticket.estimationTesting}
                        onChange={(event) =>
                          updateTicket(ticket.ticketId, {
                            estimationTesting: Number(event.target.value || 0),
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTicket(ticket.ticketId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Add Ticket to Sprint Plan
            </DialogTitle>
            <DialogDescription>
              Search tickets from external source and add them to this sprint
              planner.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Search tickets..."
            value={ticketSearch}
            onChange={(event) => setTicketSearch(event.target.value)}
          />
          <div className="h-72 overflow-y-auto rounded border border-border">
            {ticketSearchLoading ? (
              <p className="p-3 text-sm text-muted-foreground">
                Searching tickets...
              </p>
            ) : ticketSearchError ? (
              <p className="p-3 text-sm text-destructive">
                {ticketSearchError}
              </p>
            ) : ticketSearchResults.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                No tickets found.
              </p>
            ) : (
              <div className="divide-y">
                {ticketSearchResults.map((item) => {
                  const isAdded = isTicketAlreadyAdded(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex w-full items-center justify-between px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.ticketNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.ticketTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {statusLabel(item.status)}
                        </Badge>
                        <Button
                          size="sm"
                          variant={isAdded ? "secondary" : "outline"}
                          disabled={isAdded}
                          onClick={() => {
                            addTicket(item);
                            setIsAddModalOpen(false);
                          }}
                        >
                          {isAdded ? "Added" : "Add"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {ticketSearchPage}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasMoreSearchResults || ticketSearchLoading}
              onClick={loadMoreSearchResults}
            >
              {hasMoreSearchResults ? "Next Page" : "No More Tickets"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
