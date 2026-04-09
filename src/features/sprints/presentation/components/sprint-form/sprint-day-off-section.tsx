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
    <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Holidays / Days Off
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onAppend}
          disabled={isLoading}
        >
          <Plus className="h-3.5 w-3.5" /> Add Day Off
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="py-2 text-center text-xs italic text-muted-foreground">
          No holidays added yet.
        </p>
      ) : null}

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Holiday label"
                  className="h-9 text-xs"
                  {...form.register(`dayOff.${index}.label` as const)}
                  disabled={isLoading}
                />
                {Array.isArray(dayOffErrors) && dayOffErrors[index]?.label ? (
                  <FieldError errors={[dayOffErrors[index].label]} />
                ) : null}
              </div>
              <div className="w-40 space-y-1">
                <Input
                  type="date"
                  className="h-9 text-xs"
                  {...form.register(`dayOff.${index}.date` as const)}
                  disabled={isLoading}
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

      {!Array.isArray(dayOffErrors) && dayOffErrors ? (
        <FieldError errors={[dayOffErrors]} />
      ) : null}
    </div>
  )
}
