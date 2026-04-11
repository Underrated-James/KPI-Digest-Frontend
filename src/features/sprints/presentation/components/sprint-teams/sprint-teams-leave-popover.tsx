"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Palmtree,
  Thermometer,
  Clock,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { LeaveType } from "@/features/teams/domain/types/team-types";

interface SprintTeamsLeavePopoverProps {
  userId: string;
  date: string;
  currentLeave?: LeaveType;
  position: { x: number; y: number };
  onSetLeave: (userId: string, date: string, type: LeaveType) => void;
  onRemoveLeave: (userId: string, date: string) => void;
  onClose: () => void;
}

const leaveOptions: {
  type: LeaveType;
  label: string;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    type: LeaveType.SICK_LEAVE,
    label: "Sick Leave",
    icon: Thermometer,
    colorClass: "text-red-500",
  },
  {
    type: LeaveType.VACATION_LEAVE,
    label: "Vacation",
    icon: Palmtree,
    colorClass: "text-emerald-500",
  },
  {
    type: LeaveType.WHOLE_DAY_LEAVE,
    label: "Whole Day",
    icon: Calendar,
    colorClass: "text-amber-500",
  },
  {
    type: LeaveType.HALF_DAY_LEAVE,
    label: "Half Day",
    icon: Clock,
    colorClass: "text-sky-500",
  },
  {
    type: LeaveType.OTHER_LEAVE,
    label: "Other",
    icon: MoreHorizontal,
    colorClass: "text-violet-500",
  },
];

export function SprintTeamsLeavePopover({
  userId,
  date,
  currentLeave,
  position,
  onSetLeave,
  onRemoveLeave,
  onClose,
}: SprintTeamsLeavePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSelect = (type: LeaveType) => {
    if (currentLeave === type) {
      onRemoveLeave(userId, date);
    } else {
      onSetLeave(userId, date, type);
    }
    onClose();
  };

  const handleRemove = () => {
    onRemoveLeave(userId, date);
    onClose();
  };

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[180px] animate-in fade-in zoom-in-95 rounded-xl border border-border bg-popover p-2 shadow-2xl"
      style={{
        left: Math.min(position.x, window.innerWidth - 200),
        top: Math.min(position.y, window.innerHeight - 300),
      }}
    >
      <div className="mb-1 border-b border-border px-2 py-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Set Leave
        </p>
        <p className="text-xs text-foreground">{displayDate}</p>
      </div>

      <div className="space-y-0.5">
        {leaveOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => handleSelect(opt.type)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors",
              currentLeave === opt.type
                ? "bg-muted ring-1 ring-primary/30"
                : "hover:bg-muted",
            )}
          >
            <opt.icon className={cn("h-3.5 w-3.5", opt.colorClass)} />
            <span className="text-foreground">{opt.label}</span>
            {currentLeave === opt.type && (
              <span className="ml-auto text-[9px] font-semibold text-primary">
                Active
              </span>
            )}
          </button>
        ))}
      </div>

      {currentLeave && (
        <button
          onClick={handleRemove}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-border px-2 pt-2 pb-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
        >
          <X className="h-3.5 w-3.5" />
          Remove Leave
        </button>
      )}
    </div>
  );
}
