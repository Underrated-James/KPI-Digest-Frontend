"use client"

import type { FieldArrayWithId, UseFormReturn } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SprintFormValues } from "./sprint-form-schema"

interface SprintDayOffSectionProps {
  form: UseFormReturn<SprintFormValues>
  fields: FieldArrayWithId<SprintFormValues, "dayOff", "id">[]
  isLoading: boolean
  onAppend: () => void
  onRemove: (index: number) => void
}

export function SprintDayOffSection({
  form,
  fields,
  isLoading,
  onAppend,
  onRemove,
}: SprintDayOffSectionProps) {
  const dayOffErrors = form.formState.errors.dayOff

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4">
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
          disabled={isLoading}
          title="Add another day off"
        >
          <Plus className="h-3.5 w-3.5" /> Add Day Off
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex min-h-[260px] flex-1 items-center justify-center">
          <p className="text-center text-xs italic text-muted-foreground">
            No holidays added yet.
          </p>
        </div>
      ) : null}

      {fields.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="max-h-[calc(100vh-26rem)] space-y-3 overflow-y-auto pr-2">
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
                      disabled={isLoading}
                    />
                    {Array.isArray(dayOffErrors) && dayOffErrors[index]?.label ? (
                      <FieldError errors={[dayOffErrors[index].label]} />
                    ) : null}
                  </div>
                  <div className="space-y-1">
                  <Input
                    type="date"
                    className="cursor-pointer text-xs transition-colors duration-200 hover:border-ring/60 hover:bg-background/80"
                    {...form.register(`dayOff.${index}.date` as const)}
                    disabled={isLoading}
                    title="Show date picker"
                  />
                    {Array.isArray(dayOffErrors) && dayOffErrors[index]?.date ? (
                      <FieldError errors={[dayOffErrors[index].date]} />
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(index)}
                    disabled={isLoading}
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
  )
}
