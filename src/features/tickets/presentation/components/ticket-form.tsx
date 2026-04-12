"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import {
  closeTicketForm,
  selectEditingTicket,
  selectIsTicketFormOpen,
} from "../store/ticket-slice";
import { useCreateTicket } from "../hooks/use-create-ticket";
import { useUpdateTicket } from "../hooks/use-update-ticket";
import { useTicket } from "../hooks/use-tickets";
import {
  ticketFormSchema,
  TicketFormValues,
} from "./ticket-form/ticket-form-schema";
import type { PutTicketDTO, Ticket } from "../../domain/types/ticket-types";
import { TICKET_STATUS_LABELS } from "../utils/ticket-status-ui";
import { useProjectById } from "@/features/projects/presentation/hooks/use-project-by-id";
import { useProjects } from "@/features/projects/presentation/hooks/use-projects";
import { useSprintById } from "@/features/sprints/presentation/hooks/use-sprint-by-id";
import { useSprints } from "@/features/sprints/presentation/hooks/use-sprints";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ticketToFormValues(ticket: Ticket): TicketFormValues {
  const status = ticket.status;
  const allowed: TicketFormValues["status"][] = [
    "open",
    "inProgress",
    "done",
    "cancelled",
  ];
  const safeStatus = allowed.includes(status as TicketFormValues["status"])
    ? (status as TicketFormValues["status"])
    : "open";

  return {
    projectId: ticket.projectId ?? "",
    sprintId: ticket.sprintId ?? "",
    ticketNumber: ticket.ticketNumber ?? "",
    ticketTitle: ticket.ticketTitle ?? "",
    descriptionLink: ticket.descriptionLink ?? "",
    status: safeStatus,
    assignedDevId: ticket.assignedDevId ?? null,
    assignedQaId: ticket.assignedQaId ?? null,
    developmentEstimation: Number(ticket.developmentEstimation ?? 0),
    estimationTesting: Number(ticket.estimationTesting ?? 0),
  };
}

export function TicketForm() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsTicketFormOpen);
  const editingTicket = useAppSelector(selectEditingTicket);

  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();
  const { mutate: updateTicket, isPending: isUpdating } = useUpdateTicket();

  const editingTicketId = editingTicket?.id ?? "";
  const loadTicketDetail = Boolean(isOpen && editingTicket);
  const {
    data: ticketDetail,
    isLoading: isLoadingTicketDetail,
    isError: isTicketDetailError,
    error: ticketDetailError,
    isSuccess: isTicketDetailSuccess,
  } = useTicket(editingTicketId, loadTicketDetail);

  const { data: projectsData } = useProjects({ size: 100 });

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      projectId: "",
      sprintId: "",
      ticketNumber: "",
      ticketTitle: "",
      descriptionLink: "",
      status: "open",
      assignedDevId: null,
      assignedQaId: null,
      developmentEstimation: 0,
      estimationTesting: 0,
    },
  });

  const selectedProjectId = useWatch({
    control: form.control,
    name: "projectId",
  });
  const selectedSprintId = useWatch({
    control: form.control,
    name: "sprintId",
  });
  const selectedProject = React.useMemo(
    () =>
      projectsData?.content.find(
        (project) => project.id === selectedProjectId,
      ),
    [projectsData, selectedProjectId],
  );

  const {
    data: sprintsData,
    isFetched: sprintsFetched,
    isFetching: sprintsFetching,
  } = useSprints(
    { projectId: selectedProjectId, size: 100 },
    !!selectedProjectId,
  );

  const { data: projectDetail } = useProjectById(
    selectedProjectId ? selectedProjectId : null,
  );
  const { data: sprintDetail } = useSprintById(
    selectedSprintId ? selectedSprintId : null,
  );

  const selectedSprint = React.useMemo(
    () =>
      sprintsData?.content.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprintsData],
  );

  const projectNameForSprintsLink =
    selectedProject?.name ?? projectDetail?.name ?? "";

  const showNoSprintsForProject =
    Boolean(selectedProjectId) &&
    sprintsFetched &&
    !sprintsFetching &&
    (sprintsData?.content.length ?? 0) === 0 &&
    !(selectedSprintId && !selectedSprint);

  const createSprintHref = React.useMemo(() => {
    if (!selectedProjectId) return "/sprints";
    const params = new URLSearchParams();
    params.set("projectId", selectedProjectId);
    if (projectNameForSprintsLink) {
      params.set("projectName", projectNameForSprintsLink);
    }
    params.set("createSprint", "1");
    return `/sprints?${params.toString()}`;
  }, [selectedProjectId, projectNameForSprintsLink]);

  const { data: teamsData } = useTeams(
    { sprintId: selectedSprintId },
    !!selectedSprintId,
  );

  const team = teamsData?.content[0];
  const membersData = React.useMemo(() => {
    if (!team) return { devs: [], qas: [] };

    return {
      devs: team.users
        .filter((user) => user.role === "DEVS")
        .map((user) => ({ userId: user.userId, name: user.name || "Unknown" })),
      qas: team.users
        .filter((user) => user.role === "QA")
        .map((user) => ({ userId: user.userId, name: user.name || "Unknown" })),
    };
  }, [team]);

  const emptyFormDefaults = React.useMemo(
    (): TicketFormValues => ({
      projectId: "",
      sprintId: "",
      ticketNumber: "",
      ticketTitle: "",
      descriptionLink: "",
      status: "open",
      assignedDevId: null,
      assignedQaId: null,
      developmentEstimation: 0,
      estimationTesting: 0,
    }),
    [],
  );

  /** Cleared whenever the sheet closes so the next open always re-hydrates from GET /tickets/:id */
  const hydratedEditSessionRef = React.useRef<string | null>(null);

  /** Radix Select keeps internal state; remount project/sprint selects after each open + hydrate */
  const [selectSurfaceKey, setSelectSurfaceKey] = React.useState(0);
  const prevIsOpenRef = React.useRef(isOpen);

  React.useLayoutEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!isOpen) {
      hydratedEditSessionRef.current = null;
      return;
    }

    let didHydrateEdit = false;
    if (
      editingTicket &&
      isTicketDetailSuccess &&
      ticketDetail &&
      ticketDetail.id === editingTicket.id
    ) {
      const sessionKey = `edit:${editingTicket.id}`;
      if (hydratedEditSessionRef.current !== sessionKey) {
        form.reset(ticketToFormValues(ticketDetail));
        hydratedEditSessionRef.current = sessionKey;
        didHydrateEdit = true;
      }
    }

    if (justOpened || didHydrateEdit) {
      setSelectSurfaceKey((k) => k + 1);
    }
  }, [
    isOpen,
    editingTicket?.id,
    isTicketDetailSuccess,
    ticketDetail,
    form,
    editingTicket,
  ]);

  React.useEffect(() => {
    if (!isOpen) {
      hydratedEditSessionRef.current = null;
      form.reset(emptyFormDefaults);
      return;
    }
    if (!editingTicket) {
      hydratedEditSessionRef.current = null;
      form.reset(emptyFormDefaults);
    }
  }, [isOpen, editingTicket, form, emptyFormDefaults]);

  React.useEffect(() => {
    if (isOpen && !editingTicket) {
      form.setValue("status", "open");
    }
  }, [isOpen, editingTicket, form]);

  const orphanProjectLabel =
    ticketDetail?.projectName ??
    editingTicket?.projectName ??
    projectDetail?.name ??
    "Selected project";

  const orphanSprintLabel =
    ticketDetail?.sprintName ??
    editingTicket?.sprintName ??
    sprintDetail?.name ??
    "Selected sprint";

  const onSubmit = (values: TicketFormValues) => {
    if (editingTicket) {
      const payload: PutTicketDTO = {
        projectId: values.projectId,
        sprintId: values.sprintId,
        ticketNumber: values.ticketNumber.trim(),
        ticketTitle: values.ticketTitle.trim(),
        descriptionLink: values.descriptionLink.trim(),
        status: values.status,
        developmentEstimation: values.developmentEstimation,
        estimationTesting: values.estimationTesting,
        ...(values.assignedDevId
          ? { assignedDevId: values.assignedDevId }
          : {}),
        ...(values.assignedQaId ? { assignedQaId: values.assignedQaId } : {}),
      };
      updateTicket(
        { id: editingTicket.id, data: payload },
        {
          onSuccess: () => dispatch(closeTicketForm()),
        },
      );
    } else {
      createTicket(
        [
          {
            projectId: values.projectId,
            sprintId: values.sprintId,
            ticketNumber: values.ticketNumber.trim(),
            ticketTitle: values.ticketTitle.trim(),
            descriptionLink: values.descriptionLink.trim(),
            developmentEstimation: values.developmentEstimation,
            estimationTesting: values.estimationTesting,
            assignedDevId: values.assignedDevId ?? undefined,
            assignedQaId: values.assignedQaId ?? undefined,
          },
        ],
        {
          onSuccess: () => dispatch(closeTicketForm()),
        },
      );
    }
  };

  if (!isOpen) {
    return null;
  }

  const isEditBlocked =
    Boolean(editingTicket) && (isLoadingTicketDetail || isTicketDetailError);

  return (
    <Card className="mx-auto flex h-full min-h-0 w-full max-w-7xl max-h-[calc(100dvh-0.75rem)] flex-col border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-h-[calc(100vh-2rem)]">
      <CardHeader className="shrink-0 border-b border-border/80 px-4 pb-3 pt-4 text-center sm:px-6 sm:pb-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl">
          {editingTicket ? "Edit Ticket" : "Create New Ticket"}
        </CardTitle>
        <CardDescription className="text-pretty text-sm">
          Configure ticket details, ownership, and estimates in one place.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-5">
        {editingTicket && isLoadingTicketDetail ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Loading ticket…
          </p>
        ) : null}
        {editingTicket && isTicketDetailError ? (
          <p className="text-sm text-destructive py-4 text-center">
            {ticketDetailError?.message ?? "Could not load this ticket."}
          </p>
        ) : null}
        <Form {...form}>
          <form
            id="ticket-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full min-h-0 flex-col space-y-5"
          >
            <div
              className={`grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] ${isEditBlocked ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                          <Select
                          key={`project-select-${selectSurfaceKey}`}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("sprintId", "");
                            form.setValue("assignedDevId", null);
                            form.setValue("assignedQaId", null);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedProjectId && !selectedProject ? (
                              <SelectItem value={selectedProjectId}>
                                {orphanProjectLabel}
                              </SelectItem>
                            ) : null}
                            {projectsData?.content.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sprintId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sprint</FormLabel>
                          <Select
                          key={`sprint-select-${selectSurfaceKey}`}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("assignedDevId", null);
                            form.setValue("assignedQaId", null);
                          }}
                          value={field.value}
                          disabled={!selectedProjectId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sprint" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedSprintId && !selectedSprint ? (
                              <SelectItem value={selectedSprintId}>
                                {orphanSprintLabel}
                              </SelectItem>
                            ) : null}
                            {sprintsData?.content.map((sprint) => (
                              <SelectItem key={sprint.id} value={sprint.id}>
                                {sprint.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showNoSprintsForProject ? (
                    <p className="text-sm text-muted-foreground md:col-span-2">
                      This project has no sprints yet.{" "}
                      <Link
                        href={createSprintHref}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Create sprint
                      </Link>
                    </p>
                  ) : null}
                </div>

                <FormField
                  control={form.control}
                  name="ticketNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. KPI-101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Ticket title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://jira.example.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {editingTicket ? (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">
                                {TICKET_STATUS_LABELS.open}
                              </SelectItem>
                              <SelectItem value="inProgress">
                                {TICKET_STATUS_LABELS.inProgress}
                              </SelectItem>
                              <SelectItem value="done">
                                {TICKET_STATUS_LABELS.done}
                              </SelectItem>
                              <SelectItem value="cancelled">
                                {TICKET_STATUS_LABELS.cancelled}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <div className="flex min-h-10 flex-col gap-2 rounded-md border border-input bg-muted/40 px-3 py-2.5 sm:py-2">
                        <Badge
                          variant="outline"
                          className="w-fit border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          {TICKET_STATUS_LABELS.open}
                        </Badge>
                        <FormDescription className="!mt-0 text-xs leading-snug">
                          New tickets are always created with status Open. You
                          can change status after the ticket exists by editing
                          it.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}

                  <FormField
                    control={form.control}
                    name="developmentEstimation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dev Estimation (hours)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="assignedDevId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Developer</FormLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "unassigned" ? null : val)
                          }
                          value={field.value || "unassigned"}
                          disabled={!selectedSprintId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select developer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {membersData.devs.map((dev) => (
                              <SelectItem key={dev.userId} value={dev.userId}>
                                {dev.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedQaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned QA</FormLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "unassigned" ? null : val)
                          }
                          value={field.value || "unassigned"}
                          disabled={!selectedSprintId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select QA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {membersData.qas.map((qa) => (
                              <SelectItem key={qa.userId} value={qa.userId}>
                                {qa.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estimationTesting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QA Estimation (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="shrink-0 border-t border-border/80 bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full hover:bg-muted sm:h-10 sm:w-auto sm:min-w-[100px]"
            onClick={() => dispatch(closeTicketForm())}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="ticket-form"
            className="h-11 w-full px-8 sm:h-10 sm:w-auto"
            disabled={isCreating || isUpdating || isEditBlocked}
          >
            {isCreating || isUpdating
              ? "Saving..."
              : editingTicket
                ? "Update Ticket"
                : "Create Ticket"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
