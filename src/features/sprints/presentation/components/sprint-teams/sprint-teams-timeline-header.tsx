"use client";

import { isWeekend, formatDate } from "../../hooks/use-sprint-teams-page";

interface SprintTeamsTimelineHeaderProps {
  days: Date[];
  dayOffs: string[];
  colWidth: number;
}

export function SprintTeamsTimelineHeader({
  days,
  colWidth,
}: SprintTeamsTimelineHeaderProps) {
  const today = formatDate(new Date());

  // Group by month
  const months: { label: string; span: number }[] = [];
  let current = "";
  days.forEach((d) => {
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (label !== current) {
      months.push({ label, span: 1 });
      current = label;
    } else {
      months[months.length - 1].span++;
    }
  });

  return (
    <div className="sticky top-0 z-20 border-b-2 border-border bg-card">
      {/* Month row */}
      <div className="flex h-7 border-b border-border/70">
        {months.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-center border-r border-border/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ width: m.span * colWidth }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Day row */}
      <div className="flex h-9">
        {days.map((d) => {
          const dateStr = formatDate(d);
          const weekend = isWeekend(d);
          const isToday = dateStr === today;
          const dayNum = d.getDate();
          const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });

          return (
            <div
              key={dateStr}
              className={`flex flex-col items-center justify-center border-r border-border/60 transition-colors ${
                isToday
                  ? "border-primary/30 bg-primary/15"
                  : weekend
                    ? "bg-muted/50"
                    : "bg-card"
              }`}
              style={{ width: colWidth, minWidth: colWidth }}
            >
              <span
                className={`text-[9px] font-medium ${
                  isToday
                    ? "text-primary"
                    : weekend
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground"
                }`}
              >
                {dayName}
              </span>
              <span
                className={`text-[11px] font-semibold leading-none ${
                  isToday
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary"
                    : weekend
                      ? "text-muted-foreground/40"
                      : "text-foreground/80"
                }`}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
