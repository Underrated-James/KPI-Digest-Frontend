"use client";

import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SprintFormValues } from "./sprint-form-schema";

interface SprintDayOffSectionProps {
  form: UseFormReturn<SprintFormValues>;
  fields: FieldArrayWithId<SprintFormValues, "dayOff", "id">[];
  isLoading: boolean;
  viewOnly?: boolean;
  canManageDayOff: boolean;
  dayOffDateMin: string;
  dayOffDateMax: string;
  onAppend: () => void;
  onRemove: (index: number) => void;
}

export function SprintDayOffSection({
  form,
  fields,
  isLoading,
  viewOnly = false,
  canManageDayOff,
  dayOffDateMin,
  dayOffDateMax,
  onAppend,
  onRemove,
}: SprintDayOffSectionProps) {
  const dayOffErrors = form.formState.errors.dayOff;
  const shouldEnableScroll = fields.length >= 6;
  const dayOffViewportClass = "min-h-[252px] max-h-[252px]";

  return (
    <div className="flex min-h-0 flex-col space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Holidays / Days Off
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 transition-all duration-200 hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground"
          onClick={onAppend}
          disabled={isLoading || viewOnly || !canManageDayOff}
          title={
            canManageDayOff
              ? "Add another day off"
              : "Set the sprint start and end date first"
          }
        >
          <Plus className="h-3.5 w-3.5" /> Add Day Off
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {canManageDayOff
          ? `Choose holiday dates from ${dayOffDateMin} to ${dayOffDateMax}.`
          : "Set both sprint start and end dates first, then you can add holidays and days off within that range."}
      </p>

      {fields.length === 0 ? (
        <div
          className={`flex flex-1 items-center justify-center overflow-hidden ${dayOffViewportClass}`}
        >
          <p className="text-center text-xs italic text-muted-foreground">
            {canManageDayOff
              ? "No holidays added yet."
              : "Sprint dates are required before adding holidays."}
          </p>
        </div>
      ) : null}

      {fields.length > 0 ? (
        <div
          className={`flex-1 min-h-0 overflow-hidden ${dayOffViewportClass}`}
        >
          <div
            className={`h-full space-y-3 pr-2 ${
              shouldEnableScroll ? "overflow-y-auto" : "overflow-hidden"
            }`}
          >
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_170px_auto] items-start gap-3">
                  <div className="space-y-1">
                    <Input
                      placeholder="Holiday label"
                      className="text-xs"
                      {...form.register(`dayOff.${index}.label` as const)}
                      disabled={isLoading || viewOnly}
                    />
                    {Array.isArray(dayOffErrors) &&
                    dayOffErrors[index]?.label ? (
                      <FieldError errors={[dayOffErrors[index].label]} />
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      className="cursor-pointer text-xs transition-colors duration-200 hover:border-ring/60 hover:bg-background/80"
                      min={dayOffDateMin}
                      max={dayOffDateMax}
                      {...form.register(`dayOff.${index}.date` as const)}
                      disabled={isLoading || viewOnly || !canManageDayOff}
                      title={
                        canManageDayOff
                          ? `Select a holiday between ${dayOffDateMin} and ${dayOffDateMax}`
                          : "Set the sprint date range first"
                      }
                    />
                    {Array.isArray(dayOffErrors) &&
                    dayOffErrors[index]?.date ? (
                      <FieldError errors={[dayOffErrors[index].date]} />
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(index)}
                    disabled={isLoading || viewOnly}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!Array.isArray(dayOffErrors) && dayOffErrors ? (
        <FieldError errors={[dayOffErrors]} />
      ) : null}
    </div>
  );
}
