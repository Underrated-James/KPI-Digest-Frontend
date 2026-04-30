"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
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
import {
  useProjectDevelopers,
  useProjectQa,
} from "@/features/projects/presentation/hooks/use-project-members";
import { useProjects } from "@/features/projects/presentation/hooks/use-projects";
import { useSprintById } from "@/features/sprints/presentation/hooks/use-sprint-by-id";
import { useSprints } from "@/features/sprints/presentation/hooks/use-sprints";
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
    developmentEstimation:
      ticket.developmentEstimation !== undefined &&
      ticket.developmentEstimation !== null
        ? Number(ticket.developmentEstimation)
        : null,
    estimationTesting:
      ticket.estimationTesting !== undefined &&
      ticket.estimationTesting !== null
        ? Number(ticket.estimationTesting)
        : null,
    devTimeSpent:
      ticket.devTimeSpent !== undefined && ticket.devTimeSpent !== null
        ? Number(ticket.devTimeSpent)
        : null,
    testingTimeSpent:
      ticket.testingTimeSpent !== undefined &&
      ticket.testingTimeSpent !== null
        ? Number(ticket.testingTimeSpent)
        : null,
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
    mode: "onChange",
    defaultValues: {
      projectId: "",
      sprintId: "",
      ticketNumber: "",
      ticketTitle: "",
      descriptionLink: "",
      status: "open",
      assignedDevId: null,
      assignedQaId: null,
      developmentEstimation: null,
      estimationTesting: null,
      devTimeSpent: null,
      testingTimeSpent: null,
    },
  });
  const { isDirty, isValid } = form.formState;

  const selectedProjectId = useWatch({
    control: form.control,
    name: "projectId",
  });
  const [ticketNumberValue, ticketTitleValue, descriptionLinkValue] = useWatch({
    control: form.control,
    name: ["ticketNumber", "ticketTitle", "descriptionLink"],
  });
  const selectedSprintId = useWatch({
    control: form.control,
    name: "sprintId",
  });
  const selectedAssignedDevId = useWatch({
    control: form.control,
    name: "assignedDevId",
  });
  const selectedAssignedQaId = useWatch({
    control: form.control,
    name: "assignedQaId",
  });
  const selectedProject = React.useMemo(
    () =>
      projectsData?.content.find((project) => project.id === selectedProjectId),
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
    () => sprintsData?.content.find((sprint) => sprint.id === selectedSprintId),
    [selectedSprintId, sprintsData],
  );

  const projectNameForSprintsLink =
    selectedProject?.name ?? projectDetail?.name ?? "";
  const projectCodeForTicketNumber =
    selectedProject?.projectCode ?? projectDetail?.projectCode ?? "";

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

  const { data: projectDevelopers = [], isLoading: isLoadingDevelopers } =
    useProjectDevelopers(selectedProjectId || null);
  const { data: projectQa = [], isLoading: isLoadingQa } = useProjectQa(
    selectedProjectId || null,
  );

  const selectedDeveloper = React.useMemo(
    () =>
      projectDevelopers.find(
        (developer) => developer.id === selectedAssignedDevId,
      ),
    [projectDevelopers, selectedAssignedDevId],
  );
  const selectedQa = React.useMemo(
    () => projectQa.find((qa) => qa.id === selectedAssignedQaId),
    [projectQa, selectedAssignedQaId],
  );

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
      developmentEstimation: null,
      estimationTesting: null,
      devTimeSpent: null,
      testingTimeSpent: null,
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

  const orphanDeveloperLabel =
    ticketDetail?.assignedDevName ??
    editingTicket?.assignedDevName ??
    "Current developer";

  const orphanQaLabel =
    ticketDetail?.assignedQaName ??
    editingTicket?.assignedQaName ??
    "Current QA";

  const onSubmit = (values: TicketFormValues) => {
    if (editingTicket) {
      const payload: PutTicketDTO = {
        projectId: values.projectId,
        ticketNumber: values.ticketNumber.trim(),
        ticketTitle: values.ticketTitle.trim(),
        descriptionLink: values.descriptionLink.trim(),
        status: values.status,
        developmentEstimation: values.developmentEstimation,
        estimationTesting: values.estimationTesting,
        devTimeSpent: values.devTimeSpent,
        testingTimeSpent: values.testingTimeSpent,
        ...(values.sprintId ? { sprintId: values.sprintId } : {}),
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
        {
          projectId: values.projectId,
          ticketTitle: values.ticketTitle.trim(),
          descriptionLink: values.descriptionLink.trim(),
          developmentEstimation: values.developmentEstimation,
          estimationTesting: values.estimationTesting,
          devTimeSpent: values.devTimeSpent,
          testingTimeSpent: values.testingTimeSpent,
          ...(values.sprintId ? { sprintId: values.sprintId } : {}),
          assignedDevId: values.assignedDevId ?? undefined,
          assignedQaId: values.assignedQaId ?? undefined,
        },
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
  const hasRequiredVisibleFields =
    Boolean(selectedProjectId) &&
    Boolean(ticketTitleValue?.trim()) &&
    Boolean(descriptionLinkValue?.trim());
  const hasTicketNumberForUpdate =
    !editingTicket || Boolean(ticketNumberValue?.trim());
  const isSubmitDisabled =
    isCreating ||
    isUpdating ||
    isEditBlocked ||
    !hasRequiredVisibleFields ||
    !hasTicketNumberForUpdate ||
    !isValid ||
    (Boolean(editingTicket) && !isDirty);
  const ticketNumberDisplay = editingTicket
    ? ticketNumberValue?.trim() || ""
    : projectCodeForTicketNumber;

  return (
    <Card className="mx-auto flex h-full min-h-0 w-full max-w-4xl max-h-[calc(100dvh-0.75rem)] flex-col border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-h-[calc(100vh-2rem)]">
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
              className={`mx-auto grid min-h-0 flex-1 w-full max-w-2xl grid-cols-1 gap-5 md:grid-cols-2 ${isEditBlocked ? "pointer-events-none opacity-50" : ""}`}
            >
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
                      New tickets are always created with status Open. You can
                      change status after the ticket exists by editing it.
                    </FormDescription>
                  </div>
                </FormItem>
              )}

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

              <FormItem>
                <FormLabel>Ticket Number</FormLabel>
                <FormControl>
                  <Input
                    value={ticketNumberDisplay}
                    readOnly
                    placeholder={
                      editingTicket
                        ? "Loading ticket number..."
                        : "Select a project to preview its code"
                    }
                    className="cursor-default bg-muted/40 text-muted-foreground"
                  />
                </FormControl>

                <FormDescription>
                  {editingTicket
                    ? "Ticket number is assigned automatically and kept on update."
                    : "The selected project's code is shown here. The full ticket number is generated automatically after saving."}
                </FormDescription>
              </FormItem>

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
                  <FormItem className="md:col-span-2">
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

              <FormField
                control={form.control}
                name="sprintId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint</FormLabel>
                    <Select
                      key={`sprint-select-${selectSurfaceKey}`}
                      onValueChange={(value) =>
                        field.onChange(value === "__none__" ? "" : value)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No sprint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No sprint</SelectItem>
                        {selectedSprintId &&
                        !selectedSprint &&
                        selectedSprintId !== "__none__" ? (
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
                    <FormDescription>
                      Optional. Tickets can be created before a sprint exists.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedDevId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Developer</FormLabel>
                    <Select
                      key={`dev-select-${selectSurfaceKey}-${selectedProjectId || "none"}`}
                      onValueChange={(value) =>
                        field.onChange(value === "__none__" ? null : value)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Unassigned</SelectItem>
                        {field.value && !selectedDeveloper ? (
                          <SelectItem value={field.value}>
                            {orphanDeveloperLabel}
                          </SelectItem>
                        ) : null}
                        {isLoadingDevelopers ? (
                          <SelectItem value="__loading-dev" disabled>
                            Loading developers...
                          </SelectItem>
                        ) : projectDevelopers.length === 0 ? (
                          <SelectItem value="__no-devs" disabled>
                            No project developers available
                          </SelectItem>
                        ) : (
                          projectDevelopers.map((developer) => (
                            <SelectItem key={developer.id} value={developer.id}>
                              {developer.name} ({developer.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional. Leave this unassigned if you do not have members
                      or teams set up yet.
                    </FormDescription>
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
                      key={`qa-select-${selectSurfaceKey}-${selectedProjectId || "none"}`}
                      onValueChange={(value) =>
                        field.onChange(value === "__none__" ? null : value)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Unassigned</SelectItem>
                        {field.value && !selectedQa ? (
                          <SelectItem value={field.value}>
                            {orphanQaLabel}
                          </SelectItem>
                        ) : null}
                        {isLoadingQa ? (
                          <SelectItem value="__loading-qa" disabled>
                            Loading QA members...
                          </SelectItem>
                        ) : projectQa.length === 0 ? (
                          <SelectItem value="__no-qa" disabled>
                            No project QA members available
                          </SelectItem>
                        ) : (
                          projectQa.map((qa) => (
                            <SelectItem key={qa.id} value={qa.id}>
                              {qa.name} ({qa.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional. QA can also be left unassigned until the team is
                      ready.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="developmentEstimation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Development Estimate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="e.g. 8"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional hours estimate for development work.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimationTesting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QA Estimate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="e.g. 4"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional hours estimate for testing work.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="devTimeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dev Time Spent</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="e.g. 6"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional actual hours already spent by development.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testingTimeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QA Time Spent</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="e.g. 2"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional actual hours already spent by QA/testing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            disabled={isSubmitDisabled}
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
