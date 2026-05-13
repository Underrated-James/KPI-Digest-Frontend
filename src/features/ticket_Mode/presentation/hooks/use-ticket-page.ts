"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIsMobile } from "@/hooks/use-mobile";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";
import { pushTicketsUrl, replaceTicketsUrl } from "../utils/tickets-url-state";

type DeleteTarget = {
  id?: string;
  ticketNumber: string;
};

type TicketDataset = {
  data: {
    content: Ticket[];
  };
};

const emptyTicketPayload: TicketDataset = {
  data: {
    content: [],
  },
};

function normalizeTicketStatus(
  status: string | null | undefined,
): TicketStatus {
  switch (status) {
    case "done":
    case "cancelled":
    case "open":
    case "inProgress":
      return status;
    case "review":
    case "testing":
      return "inProgress";
    default:
      return "open";
  }
}

function isDurationString(value: string | undefined) {
  return Boolean(value && /^\d{2}:\d{2}:\d{2}$/.test(value));
}

function isIsoDateTime(value: string | undefined) {
  if (!value || isDurationString(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function parseDurationToSeconds(value: string | undefined) {
  if (!isDurationString(value)) {
    return 0;
  }

  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatIsoTime(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "00:00:00";
  }

  return [
    parsedDate.getHours(),
    parsedDate.getMinutes(),
    parsedDate.getSeconds(),
  ]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

function normalizeTicket(ticket: Ticket): Ticket {
  const hasLegacyStartedAt = isIsoDateTime(ticket.time);
  const normalizedStatus = normalizeTicketStatus(ticket.status);
  const isLegacyRunningStatus = normalizedStatus === "inProgress";

  return {
    ...ticket,
    status: normalizedStatus,
    time: ticket.time ?? "00:00:00",
    timerRunning:
      ticket.timerRunning ?? (hasLegacyStartedAt ? isLegacyRunningStatus : false),
    timerStartedAt:
      ticket.timerStartedAt ?? (hasLegacyStartedAt ? ticket.time ?? null : null),
    completedAt:
      ticket.completedAt ??
      (hasLegacyStartedAt && !isLegacyRunningStatus ? ticket.time ?? null : null),
  };
}

function sortTickets(tickets: Ticket[]) {
  return [...tickets].sort((left, right) => {
    const leftDate = left.updatedAt ?? left.createdAt ?? "";
    const rightDate = right.updatedAt ?? right.createdAt ?? "";
    return rightDate.localeCompare(leftDate);
  });
}

function getElapsedSeconds(ticket: Ticket, now = Date.now()) {
  const baseSeconds = isDurationString(ticket.time)
    ? parseDurationToSeconds(ticket.time)
    : 0;

  if (!ticket.timerRunning || !ticket.timerStartedAt) {
    return baseSeconds;
  }

  const startedAt = new Date(ticket.timerStartedAt).getTime();
  if (Number.isNaN(startedAt)) {
    return baseSeconds;
  }

  return baseSeconds + Math.max(0, Math.floor((now - startedAt) / 1000));
}

function getTimerDisplayValue(ticket: Ticket, now = Date.now()) {
  if (!ticket.timerRunning) {
    if (isDurationString(ticket.time)) {
      return ticket.time;
    }

    if (isIsoDateTime(ticket.time)) {
      return formatIsoTime(ticket.time);
    }

    return ticket.time || "00:00:00";
  }

  return formatDuration(getElapsedSeconds(ticket, now));
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function useTicketPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [timerTick, setTimerTick] = useState(Date.now());

  const search = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const selectedStatus: TicketStatus | "ALL" =
    (searchParams.get("status") as TicketStatus | null) || "ALL";
  const selectedProjectId = searchParams.get("projectId");
  const isFormOpen = false;

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch("/api/ticket-mode/dev", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load ticket mode data.");
      }

      const payload = (await response.json()) as TicketDataset;
      const normalizedTickets = sortTickets(
        (payload.data?.content ?? emptyTicketPayload.data.content).map(
          normalizeTicket,
        ),
      );
      setAllTickets(normalizedTickets);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Failed to load ticket mode data.");
      setIsError(true);
      setError(nextError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const normalizedSearchTerm = debouncedSearchTerm.trim();
    if (normalizedSearchTerm === search) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (normalizedSearchTerm) {
      params.set("search", normalizedSearchTerm);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    replaceTicketsUrl(pathname, params);
  }, [debouncedSearchTerm, pathname, search, searchParams]);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    if (!allTickets.some((ticket) => ticket.timerRunning)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimerTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = normalizeText(debouncedSearchTerm);

    return allTickets.filter((ticket) => {
      const matchesStatus =
        selectedStatus === "ALL" ? true : ticket.status === selectedStatus;
      const matchesProject =
        !selectedProjectId || selectedProjectId === "ALL"
          ? true
          : ticket.projectId === selectedProjectId;
      const matchesSearch = normalizedSearch
        ? [
            ticket.ticketNumber,
            ticket.ticketTitle,
            ticket.projectName,
            ticket.assignedDevName,
          ]
            .map((value) => normalizeText(value))
            .some((value) => value.includes(normalizedSearch))
        : true;

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [allTickets, debouncedSearchTerm, selectedProjectId, selectedStatus]);

  const total = filteredTickets.length;
  const maxPage = Math.max(1, Math.ceil(total / size));

  useEffect(() => {
    if (page <= maxPage) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", maxPage.toString());
    replaceTicketsUrl(pathname, params);
  }, [maxPage, page, pathname, searchParams]);

  useEffect(() => {
    setSelectedTicketIds((current) =>
      current.filter((id) => allTickets.some((ticket) => ticket.id === id)),
    );
  }, [allTickets]);

  useEffect(() => {
    if (!viewTicket) {
      return;
    }

    const nextViewTicket = allTickets.find((ticket) => ticket.id === viewTicket.id);
    if (nextViewTicket && nextViewTicket !== viewTicket) {
      setViewTicket(nextViewTicket);
    }
  }, [allTickets, viewTicket]);

  const currentPage = Math.min(page, maxPage);
  const pageStartIndex = (currentPage - 1) * size;
  const tickets = filteredTickets.slice(pageStartIndex, pageStartIndex + size);

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          allTickets.map((ticket) => [
            ticket.projectId,
            {
              id: ticket.projectId,
              name: ticket.projectName ?? "Unnamed Project",
              projectCode: "",
            },
          ]),
        ).values(),
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [allTickets],
  );

  const updateStatusFilter = (status: TicketStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    pushTicketsUrl(pathname, params);
  };

  const updateProjectFilter = (projectId: string | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (projectId === "ALL") {
      params.delete("projectId");
    } else {
      params.set("projectId", projectId);
    }
    pushTicketsUrl(pathname, params);
  };

  const persistTicketChanges = useCallback(
    async (id: string, changes: Partial<Ticket>) => {
      const response = await fetch("/api/ticket-mode/dev", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, changes }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message ?? "Failed to persist ticket changes.");
      }
    },
    [],
  );

  const updateTicketState = useCallback(
    (ticketId: string, updater: (ticket: Ticket) => Ticket) => {
      setAllTickets((current) =>
        sortTickets(
          current.map((ticket) =>
            ticket.id === ticketId ? updater(ticket) : ticket,
          ),
        ),
      );
    },
    [],
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget?.id) {
      setAllTickets((current) =>
        current.filter((ticket) => ticket.id !== deleteTarget.id),
      );
      setSelectedTicketIds((current) =>
        current.filter((selectedId) => selectedId !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Ticket removed from static ticket mode");
      return;
    }

    if (selectedTicketIds.length === 0) {
      return;
    }

    setIsBulkDeleting(true);
    setAllTickets((current) =>
      current.filter((ticket) => !selectedTicketIds.includes(ticket.id)),
    );
    setSelectedTicketIds([]);
    setDeleteTarget(null);
    toast.success(
      selectedTicketIds.length === 1
        ? "Ticket removed from static ticket mode"
        : `${selectedTicketIds.length} tickets removed from static ticket mode`,
    );
    setIsBulkDeleting(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleStartTimer = async (ticket: Ticket) => {
    if (ticket.timerRunning || ticket.status === "done") {
      return;
    }

    const startedAt = new Date().toISOString();
    const nextStatus = ticket.status === "open" ? "inProgress" : ticket.status;

    updateTicketState(ticket.id, (currentTicket) => ({
      ...currentTicket,
      status: nextStatus,
      timerRunning: true,
      timerStartedAt: startedAt,
      updatedAt: startedAt,
    }));

    try {
      await persistTicketChanges(ticket.id, {
        status: nextStatus,
        timerRunning: true,
        timerStartedAt: startedAt,
        updatedAt: startedAt,
      });
    } catch (caughtError) {
      await fetchTickets();
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to start the timer.",
      );
    }
  };

  const handlePauseTimer = async (ticket: Ticket) => {
    if (!ticket.timerRunning) {
      return;
    }

    const pausedAt = new Date().toISOString();
    const nextDuration = formatDuration(getElapsedSeconds(ticket));

    updateTicketState(ticket.id, (currentTicket) => ({
      ...currentTicket,
      time: nextDuration,
      timerRunning: false,
      timerStartedAt: null,
      updatedAt: pausedAt,
    }));

    try {
      await persistTicketChanges(ticket.id, {
        time: nextDuration,
        timerRunning: false,
        timerStartedAt: null,
        updatedAt: pausedAt,
      });
    } catch (caughtError) {
      await fetchTickets();
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to pause the timer.",
      );
    }
  };

  const handleCompleteTimer = async (ticket: Ticket) => {
    const completedAt = new Date().toISOString();
    const nextDuration = formatDuration(getElapsedSeconds(ticket));

    updateTicketState(ticket.id, (currentTicket) => ({
      ...currentTicket,
      status: "done",
      time: nextDuration,
      timerRunning: false,
      timerStartedAt: null,
      completedAt,
      updatedAt: completedAt,
    }));

    try {
      await persistTicketChanges(ticket.id, {
        status: "done",
        time: nextDuration,
        timerRunning: false,
        timerStartedAt: null,
        completedAt,
        updatedAt: completedAt,
      });
      toast.success(`${ticket.ticketNumber} marked as completed.`);
    } catch (caughtError) {
      await fetchTickets();
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to complete the ticket.",
      );
    }
  };

  return {
    tickets,
    total,
    isLoading,
    isError,
    error,
    refetch: fetchTickets,
    isMobile,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    selectedProjectId,
    projectOptions,
    updateStatusFilter,
    updateProjectFilter,
    isFormOpen,
    deleteTarget,
    viewTicket,
    selectedTicketIds,
    onAddTicket: () => toast("Ticket Mode uses local static data."),
    onEditTicket: () => toast("Edit is disabled in static Ticket Mode."),
    onViewTicket: (ticket: Ticket) => setViewTicket(ticket),
    onCloseViewTicket: () => setViewTicket(null),
    onStatusChange: (ticket: Ticket, status: TicketStatus) => {
      updateTicketState(ticket.id, (currentTicket) => ({
        ...currentTicket,
        status,
        updatedAt: new Date().toISOString(),
      }));
      toast.success(`Updated ${ticket.ticketNumber} to ${status}`);
    },
    onStartTimer: handleStartTimer,
    onPauseTimer: handlePauseTimer,
    onCompleteTimer: handleCompleteTimer,
    getTimerDisplay: (ticket: Ticket) =>
      getTimerDisplayValue(ticket, timerTick),
    onDeleteTicket: (ticket: Ticket) =>
      setDeleteTarget({ id: ticket.id, ticketNumber: ticket.ticketNumber }),
    onSelectionChange: setSelectedTicketIds,
    onBulkDelete: () => {
      if (selectedTicketIds.length === 0) {
        return;
      }

      setDeleteTarget({
        ticketNumber:
          selectedTicketIds.length === 1
            ? "1 selected ticket"
            : `${selectedTicketIds.length} selected tickets`,
      });
    },
    isDeleteLoading: isBulkDeleting,
    statusChangePendingTicketId: null,
    handleDeleteConfirm,
    handleCloseDeleteModal,
  };
}
