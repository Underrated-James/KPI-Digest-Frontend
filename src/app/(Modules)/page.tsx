"use client";

import { useMemo, useState } from "react";

type TicketStatus = "Done" | "In Progress" | "Open";
type SprintStatus = "Completed" | "Active" | "Draft";

type SprintRow = {
  name: string;
  status: SprintStatus;
  start: string;
  end: string;
  tickets: string;
  progress: number;
};

type RecentTicket = {
  title: string;
  assignee: string;
  date: string;
  status: TicketStatus;
};

type ProjectDashboardData = {
  projectCode: string;
  health: "Active" | "At Risk" | "Critical";
  createdAt: string;
  members: number;
  totalSprints: number;
  completedSprints: number;
  totalTickets: number;
  completedTickets: number;
  openTickets: number;
  completionTrend: number[];
  workload: { name: string; points: number }[];
  recentTickets: RecentTicket[];
  sprintRows: SprintRow[];
  teamMembers: number;
  activity: { text: string; by: string; at: string }[];
};

const projectNames = ["Repnotes", "AltInvest", "Nimbus", "Stratus", "Kondo Ko"];

const projectDashboardMap: Record<string, ProjectDashboardData> = {
  Repnotes: {
    projectCode: "RPNOTS",
    health: "Active",
    createdAt: "2025-12-01",
    members: 8,
    totalSprints: 4,
    completedSprints: 2,
    totalTickets: 14,
    completedTickets: 8,
    openTickets: 6,
    completionTrend: [1, 2, 4, 6, 8, 11],
    workload: [
      { name: "Frank", points: 6 },
      { name: "Grace", points: 5 },
      { name: "Hana", points: 4 },
      { name: "Isha", points: 7 },
      { name: "Noah", points: 3 },
    ],
    recentTickets: [
      { title: "RPNOTS - 101", assignee: "Frank", date: "2026-04-11", status: "Done" },
      { title: "RPNOTS - 112", assignee: "Grace", date: "2026-04-12", status: "Done" },
      { title: "RPNOTS - 129", assignee: "Hana", date: "2026-04-13", status: "In Progress" }
    ],
    sprintRows: [
      {
        name: "Sprint 1 - Client Project Requirements",
        status: "Completed",
        start: "2025-12-05",
        end: "2025-12-18",
        tickets: "12/12",
        progress: 100,
      },
      {
        name: "Sprint 2 - Visualizations",
        status: "Active",
        start: "2025-12-19",
        end: "2026-01-01",
        tickets: "9/15",
        progress: 60,
      },
      {
        name: "Sprint 3 - Dashboard Hardening",
        status: "Draft",
        start: "2026-01-02",
        end: "2026-01-15",
        tickets: "0/12",
        progress: 0,
      },
      {
        name: "Sprint 4 - KPI QA Pass",
        status: "Draft",
        start: "2026-01-16",
        end: "2026-01-29",
        tickets: "0/9",
        progress: 0,
      },
    ],
    teamMembers: 8,
    activity: [
      {
        text: "Sprint 2 - Visualizations started",
        by: "Frank",
        at: "4/14/2026, 8:00:00 AM",
      },
      {
        text: "Real-time data sync moved to In Progress",
        by: "Grace",
        at: "4/14/2026, 10:15:00 AM",
      },
      { text: "RPNOTS - 133 added to backlog", by: "Isha", at: "4/14/2026, 2:30:00 PM" },
      { text: "Sprint 3 plan drafted", by: "Noah", at: "4/15/2026, 9:40:00 AM" },
    ],
  },
  AltInvest: {
    projectCode: "ALTNVST",
    health: "At Risk",
    createdAt: "2025-11-15",
    members: 7,
    totalSprints: 4,
    completedSprints: 1,
    totalTickets: 15,
    completedTickets: 5,
    openTickets: 10,
    completionTrend: [1, 1, 2, 3, 4, 5],
    workload: [
      { name: "Mina", points: 7 },
      { name: "Kai", points: 5 },
      { name: "Luis", points: 3 },
      { name: "Rhea", points: 6 },
      { name: "Tom", points: 4 },
    ],
    recentTickets: [
      { title: "ALTNVST - 101", assignee: "Mina", date: "2026-04-10", status: "In Progress" },
      { title: "ALTNVST - 106", assignee: "Kai", date: "2026-04-11", status: "Done" },
      { title: "ALTNVST - 111", assignee: "Luis", date: "2026-04-12", status: "Open" },
      { title: "ALTNVST - 119", assignee: "Rhea", date: "2026-04-13", status: "Open" },
      { title: "ALTNVST - 123", assignee: "Tom", date: "2026-04-15", status: "In Progress" },
    ],
    sprintRows: [
      {
        name: "Sprint 1 - Client Project Requirements",
        status: "Completed",
        start: "2025-11-18",
        end: "2025-11-30",
        tickets: "10/10",
        progress: 100,
      },
      {
        name: "Sprint 2 - Portfolio Feed Stabilization",
        status: "Active",
        start: "2025-12-01",
        end: "2025-12-14",
        tickets: "6/14",
        progress: 43,
      },
      {
        name: "Sprint 3 - Risk Backlog Cleanup",
        status: "Draft",
        start: "2025-12-15",
        end: "2025-12-28",
        tickets: "0/11",
        progress: 0,
      },
      {
        name: "Sprint 4 - Production Readiness",
        status: "Draft",
        start: "2025-12-29",
        end: "2026-01-11",
        tickets: "0/10",
        progress: 0,
      },
    ],
    teamMembers: 6,
    activity: [
      { text: "Portfolio feed bug triaged", by: "Mina", at: "4/13/2026, 7:35:00 PM" },
      { text: "ALTNVST - 111 moved to Open", by: "Luis", at: "4/14/2026, 9:42:00 AM" },
      { text: "ALTNVST - 119 blocked by dependency", by: "Rhea", at: "4/14/2026, 12:05:00 PM" },
      { text: "Sprint 3 moved to Draft", by: "Tom", at: "4/15/2026, 8:48:00 AM" },
    ],
  },
  Nimbus: {
    projectCode: "NMBS",
    health: "Active",
    createdAt: "2025-10-02",
    members: 10,
    totalSprints: 5,
    completedSprints: 3,
    totalTickets: 22,
    completedTickets: 14,
    openTickets: 8,
    completionTrend: [2, 4, 6, 9, 12, 15],
    workload: [
      { name: "Nia", points: 8 },
      { name: "Rafi", points: 6 },
      { name: "Tara", points: 5 },
      { name: "Moe", points: 7 },
      { name: "Ava", points: 6 },
    ],
    recentTickets: [
      { title: "NMBS - 101", assignee: "Nia", date: "2026-04-12", status: "Done" },
      { title: "NMBS - 118", assignee: "Rafi", date: "2026-04-14", status: "In Progress" },
      { title: "NMBS - 120", assignee: "Tara", date: "2026-04-15", status: "Open" },
      { title: "NMBS - 133", assignee: "Moe", date: "2026-04-15", status: "In Progress" },
      { title: "NMBS - 141", assignee: "Ava", date: "2026-04-15", status: "Open" },
    ],
    sprintRows: [
      {
        name: "Sprint 1 - Client Project Requirements",
        status: "Completed",
        start: "2025-10-05",
        end: "2025-10-17",
        tickets: "11/11",
        progress: 100,
      },
      {
        name: "Sprint 2 - Search Optimization",
        status: "Completed",
        start: "2025-10-18",
        end: "2025-10-30",
        tickets: "13/13",
        progress: 100,
      },
      {
        name: "Sprint 3 - Reporting QA Readiness",
        status: "Active",
        start: "2025-10-31",
        end: "2025-11-12",
        tickets: "7/14",
        progress: 50,
      },
      {
        name: "Sprint 4 - Data Export",
        status: "Draft",
        start: "2025-11-13",
        end: "2025-11-26",
        tickets: "0/10",
        progress: 0,
      },
      {
        name: "Sprint 5 - Ops Improvements",
        status: "Draft",
        start: "2025-11-27",
        end: "2025-12-10",
        tickets: "0/12",
        progress: 0,
      },
    ],
    teamMembers: 10,
    activity: [
      { text: "Sprint 3 kickoff complete", by: "Nia", at: "4/12/2026, 9:10:00 AM" },
      { text: "Reporting test suite updated", by: "Rafi", at: "4/13/2026, 4:20:00 PM" },
      { text: "NMBS - 133 moved to In Progress", by: "Moe", at: "4/15/2026, 1:01:00 PM" },
      { text: "Ops board refreshed", by: "Ava", at: "4/15/2026, 2:28:00 PM" },
    ],
  },
  Stratus: {
    projectCode: "STRTS",
    health: "Critical",
    createdAt: "2025-12-10",
    members: 7,
    totalSprints: 4,
    completedSprints: 0,
    totalTickets: 18,
    completedTickets: 4,
    openTickets: 14,
    completionTrend: [0, 1, 1, 2, 3, 4],
    workload: [
      { name: "Ari", points: 7 },
      { name: "Noel", points: 6 },
      { name: "Jin", points: 6 },
      { name: "Kris", points: 8 },
      { name: "Elle", points: 7 },
    ],
    recentTickets: [
      { title: "STRTS - 101", assignee: "Ari", date: "2026-04-09", status: "In Progress" },
      { title: "STRTS - 109", assignee: "Noel", date: "2026-04-13", status: "Open" },
      { title: "STRTS - 121", assignee: "Jin", date: "2026-04-15", status: "Open" },
      { title: "STRTS - 126", assignee: "Kris", date: "2026-04-15", status: "Open" },
      { title: "STRTS - 131", assignee: "Elle", date: "2026-04-15", status: "In Progress" },
    ],
    sprintRows: [
      {
        name: "Sprint 1 - Client Project Requirements",
        status: "Active",
        start: "2025-12-12",
        end: "2025-12-26",
        tickets: "5/13",
        progress: 38,
      },
      {
        name: "Sprint 2 - Risk Mitigation Tasks",
        status: "Draft",
        start: "2025-12-27",
        end: "2026-01-09",
        tickets: "0/0",
        progress: 0,
      },
      {
        name: "Sprint 3 - Infrastructure Recovery",
        status: "Draft",
        start: "2026-01-10",
        end: "2026-01-23",
        tickets: "0/14",
        progress: 0,
      },
      {
        name: "Sprint 4 - Stabilization",
        status: "Draft",
        start: "2026-01-24",
        end: "2026-02-06",
        tickets: "0/13",
        progress: 0,
      },
    ],
    teamMembers: 7,
    activity: [
      { text: "Incident war-room started", by: "Ari", at: "4/15/2026, 11:05:00 AM" },
      { text: "Critical blockers added to sprint board", by: "Noel", at: "4/15/2026, 1:15:00 PM" },
      { text: "STRTS - 131 assigned to response team", by: "Kris", at: "4/15/2026, 2:02:00 PM" },
      { text: "Escalation notes shared", by: "Elle", at: "4/15/2026, 3:22:00 PM" },
    ],
  },
  "Kondo Ko": {
    projectCode: "KNDOKO",
    health: "Active",
    createdAt: "2025-09-21",
    members: 5,
    totalSprints: 4,
    completedSprints: 2,
    totalTickets: 12,
    completedTickets: 7,
    openTickets: 5,
    completionTrend: [1, 2, 4, 5, 6, 8],
    workload: [
      { name: "Miko", points: 5 },
      { name: "Sia", points: 4 },
      { name: "Dev", points: 3 },
      { name: "Lyn", points: 6 },
      { name: "Joel", points: 4 },
    ],
    recentTickets: [
      { title: "KNDOKO - 101", assignee: "Miko", date: "2026-04-11", status: "Done" },
      { title: "KNDOKO - 108", assignee: "Sia", date: "2026-04-14", status: "In Progress" },
      { title: "KNDOKO - 110", assignee: "Dev", date: "2026-04-15", status: "Open" }
    ],
    sprintRows: [
      {
        name: "Sprint 1 - Client Project Requirements",
        status: "Completed",
        start: "2025-09-24",
        end: "2025-10-06",
        tickets: "8/8",
        progress: 100,
      },
      {
        name: "Sprint 2 - Team Enablement",
        status: "Active",
        start: "2025-10-07",
        end: "2025-10-20",
        tickets: "4/7",
        progress: 57,
      },
      {
        name: "Sprint 3 - Project Onboarding",
        status: "Draft",
        start: "2025-10-21",
        end: "2025-11-03",
        tickets: "0/8",
        progress: 0,
      },
      {
        name: "Sprint 4 - Delivery Optimization",
        status: "Draft",
        start: "2025-11-04",
        end: "2025-11-17",
        tickets: "0/10",
        progress: 0,
      },
    ],
    teamMembers: 5,
    activity: [
      { text: "Enablement workshop done", by: "Miko", at: "4/14/2026, 3:30:00 PM" },
      { text: "KNDOKO - 110 created", by: "Dev", at: "4/15/2026, 9:12:00 AM" },
      { text: "KNDOKO - 114 moved to In Progress", by: "Lyn", at: "4/15/2026, 11:44:00 AM" },
      { text: "Sprint 3 drafted", by: "Joel", at: "4/15/2026, 2:19:00 PM" },
    ],
  },
};

const statusPillStyles: Record<string, string> = {
  Active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "At Risk": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Critical: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  Completed: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Draft: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  Done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "In Progress": "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  Open: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  const selectedDashboard = useMemo(
    () => (selectedProject ? projectDashboardMap[selectedProject] : undefined),
    [selectedProject],
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 rounded-2xl bg-background text-foreground dark:bg-zinc-950">
      <header className="rounded-2xl border border-border/70 bg-card p-5 text-foreground shadow-xl dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{selectedProject || "Select a Project"}</h1>
              {selectedDashboard ? (
                <span
                  className={`rounded-full border px-2 py-1 text-xs ${statusPillStyles[selectedDashboard.health]}`}
                >
                  {selectedDashboard.health}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">
              {selectedDashboard
                ? `${selectedDashboard.members} members • Created ${selectedDashboard.createdAt}`
                : "Choose a project to render static dashboard data"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="h-10 min-w-52 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground outline-none dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Select project</option>
              {projectNames.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
            <button className="h-10 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-200">
              + Sprint
            </button>
            <button className="h-10 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white">
              Ticket
            </button>
          </div>
        </div>
      </header>

      {!selectedDashboard ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Sprint Summary Card",
            "Ticket Summary Card",
            "Ticket Completion Trend Card",
            "Workload Distribution Card",
            "Recent Tickets Card",
            "Sprint Overview Card",
          ].map((label) => (
            <article
              key={label}
              className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{label}</h2>
                <span className="text-[11px] text-muted-foreground dark:text-zinc-400">No project selected</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted dark:bg-zinc-700/70" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-zinc-700/70" />
                <div className="h-16 w-full animate-pulse rounded-xl bg-muted/80 dark:bg-zinc-800/80" />
              </div>
            </article>
          ))}
        </section>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-2">
            <SummaryPanel
              title="Sprint Summary"
              rows={[
                { label: "Total Sprints", value: selectedDashboard.totalSprints },
                {
                  label: "Active Sprints",
                  value: selectedDashboard.totalSprints - selectedDashboard.completedSprints,
                },
                { label: "Completed Sprints", value: selectedDashboard.completedSprints },
              ]}
            />
            <SummaryPanel
              title="Ticket Summary"
              rows={[
                { label: "Total Tickets", value: selectedDashboard.totalTickets },
                { label: "Completed Tickets", value: selectedDashboard.completedTickets },
                { label: "Open Tickets", value: selectedDashboard.openTickets },
              ]}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
              <h3 className="mb-4 text-sm font-semibold">Ticket Completion Trend</h3>
              <div className="flex h-40 items-end gap-4 rounded-lg border border-border/50 bg-background p-4 dark:border-white/10 dark:bg-zinc-950">
                {selectedDashboard.completionTrend.map((value, index) => (
                  <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded bg-emerald-400/80"
                      style={{ height: `${Math.max(20, value * 10)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground dark:text-zinc-400">{`Week ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
              <h3 className="mb-4 text-sm font-semibold">Workload Distribution</h3>
              <div className="space-y-3 rounded-lg border border-border/50 bg-background p-4 dark:border-white/10 dark:bg-zinc-950">
                {selectedDashboard.workload.map((person) => (
                  <div key={person.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-zinc-400">
                      <span>{person.name}</span>
                      <span>{person.points} pts</span>
                    </div>
                    <div className="h-2 rounded bg-muted dark:bg-zinc-800">
                      <div
                        className="h-2 rounded bg-violet-500"
                        style={{ width: `${(person.points / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
              <h3 className="mb-4 text-sm font-semibold">Recent Tickets</h3>
              <div className="space-y-2">
                {selectedDashboard.recentTickets.map((ticket) => (
                  <div
                    key={ticket.title}
                    className="rounded-lg border border-border/50 bg-background p-3 dark:border-white/10 dark:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${statusPillStyles[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground dark:text-zinc-400">
                      {ticket.assignee} • {ticket.date}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
            <h3 className="mb-4 text-sm font-semibold">Sprint Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-muted-foreground dark:text-zinc-500">
                  <tr>
                    <th className="px-2 py-2">Sprint</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Start</th>
                    <th className="px-2 py-2">End</th>
                    <th className="px-2 py-2">Tickets</th>
                    <th className="px-2 py-2">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDashboard.sprintRows.map((sprint) => (
                    <tr key={sprint.name} className="border-t border-border/50 dark:border-white/10">
                      <td className="px-2 py-3">{sprint.name}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] ${statusPillStyles[sprint.status]}`}
                        >
                          {sprint.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground dark:text-zinc-400">{sprint.start}</td>
                      <td className="px-2 py-3 text-muted-foreground dark:text-zinc-400">{sprint.end}</td>
                      <td className="px-2 py-3">{sprint.tickets}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-28 rounded bg-muted dark:bg-zinc-800">
                            <div
                              className="h-2 rounded bg-blue-500"
                              style={{ width: `${sprint.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground dark:text-zinc-400">
                            {sprint.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold">Activity Feed</h3>
              <div className="space-y-2">
                {selectedDashboard.activity.map((item) => (
                  <div
                    key={item.text}
                    className="rounded-lg border border-border/50 bg-background p-3 dark:border-white/10 dark:bg-zinc-950"
                  >
                    <p className="text-sm">{item.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground dark:text-zinc-400">
                      {item.by} • {item.at}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
              <h3 className="mb-4 text-sm font-semibold">Sprint Status</h3>
              <div className="flex items-center justify-center p-4">
                <div className="relative h-36 w-36 rounded-full bg-gradient-to-b from-emerald-500 to-blue-500 p-4">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-card dark:bg-zinc-900">
                    <span className="text-sm text-muted-foreground dark:text-zinc-300">
                      {Math.round((selectedDashboard.completedSprints / selectedDashboard.totalSprints) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground dark:text-zinc-400">
                <span>Active: {selectedDashboard.totalSprints - selectedDashboard.completedSprints}</span>
                <span>Completed: {selectedDashboard.completedSprints}</span>
              </div>
            </article>
          </section>
        </>
      )}
    </section>
  );
}

function SummaryPanel({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 text-foreground dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-3 py-2 dark:border-white/10 dark:bg-zinc-950"
          >
            <p className="text-sm text-muted-foreground dark:text-zinc-300">{row.label}</p>
            <p className="text-lg font-semibold">{row.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
