"use client"

import { useState } from "react"
import { Controller, useController, type UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SprintFormValues } from "./sprint-form-schema"
import {
  parseDateInputValue,
  sprintDurationPresetValues,
  toDateInputValue,
} from "./sprint-form-utils"

interface SprintCoreFieldsProps {
  form: UseFormReturn<SprintFormValues>
  isLoading: boolean
  computedDuration: number
  isUpdateMode: boolean
  viewOnly?: boolean
}

function SprintHoursPerDayField({
  form,
  isLoading,
  viewOnly = false,
}: Pick<SprintCoreFieldsProps, "form" | "isLoading" | "viewOnly">) {
  const { field, fieldState } = useController({
    control: form.control,
    name: "workingHoursDay",
  })
  const [inputValue, setInputValue] = useState(
    field.value === undefined || field.value === null ? "" : String(field.value),
  )

  const commitValue = (nextValue: string) => {
    setInputValue(nextValue)
    field.onChange(nextValue === "" ? undefined : Number(nextValue))
  }

  const stepValue = (delta: number) => {
    const current = inputValue === "" ? 8 : Number(inputValue)

    if (Number.isNaN(current)) {
      commitValue("8")
      return
    }

    const next = Math.min(24, Math.max(1, Math.round((current + delta) * 2) / 2))
    commitValue(String(next))
  }

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>Working Hours Per Day</FieldLabel>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => stepValue(-0.5)}
          disabled={isLoading || viewOnly}
          aria-label="Decrease hours per day"
        >
          -
        </Button>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="8"
          value={inputValue}
          onChange={(event) => {
            const nextValue = event.target.value
            if (nextValue === "") {
              commitValue("")
              return
            }

            if (/^\d*\.?\d*$/.test(nextValue)) {
              commitValue(nextValue)
            }
          }}
          onBlur={() => {
            if (inputValue === "") {
              return
            }

            const next = Number(inputValue)
            if (Number.isNaN(next)) {
              commitValue("8")
              return
            }

            commitValue(String(Math.min(24, Math.max(1, next))))
          }}
          disabled={isLoading || viewOnly}
          className="text-left"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => stepValue(0.5)}
          disabled={isLoading || viewOnly}
          aria-label="Increase hours per day"
        >
          +
        </Button>
      </div>
      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
    </Field>
  )
}

export function SprintCoreFields({
  form,
  isLoading,
  computedDuration,
  isUpdateMode,
  viewOnly = false,
}: SprintCoreFieldsProps) {
  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")
  const durationPreset = form.watch("durationPreset")
  const durationLabels: Record<
    (typeof sprintDurationPresetValues)[number],
    string
  > = {
    "1w": "1 Week",
    "2w": "2 Weeks",
    "4w": "4 Weeks",
    custom: "Custom",
  }

  return (
    <>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Sprint Name</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Sprint 1.0"
              disabled={isLoading || viewOnly}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) =>
          isUpdateMode ? (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Status</FieldLabel>
              {viewOnly ? (
                <div className="flex min-h-10 items-center rounded-md border border-border bg-muted/40 px-3 py-2 text-sm capitalize">
                  {String(field.value ?? "")}
                </div>
              ) : (
                <select
                  {...field}
                  disabled={isLoading}
                  className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          ) : (
            // ✅ CREATE MODE → BADGE (READ-ONLY)
            <Field>
              <FieldLabel>Status</FieldLabel>
              <div className="flex min-h-10 flex-col gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5">
                <span className="w-fit rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                  Draft
                </span>

                <FieldDescription className="!mt-0 text-xs leading-snug">
                  New sprints are always created as Draft. You can change the status after creation.
                </FieldDescription>
              </div>
            </Field>
          )
        }
      />

      <Controller
        name="durationPreset"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Duration</FieldLabel>
            <select
              {...field}
              disabled={isLoading || viewOnly}
              className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            >
              {sprintDurationPresetValues.map((option) => (
                <option key={option} value={option}>
                  {durationLabels[option]}
                </option>
              ))}
            </select>
            <FieldDescription className="text-xs">
              {field.value === "custom"
                ? "Choose both start and end dates manually."
                : "Choose a start date and the end date will be set automatically."}
            </FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="startDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Start Date</FieldLabel>
            <Input
              type="date"
              name={field.name}
              value={toDateInputValue(field.value)}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parseDateInputValue(event.target.value))
              }
              ref={field.ref}
              disabled={isLoading || viewOnly}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="endDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>End Date</FieldLabel>
            <Input
              type="date"
              name={field.name}
              value={toDateInputValue(field.value)}
              min={toDateInputValue(startDate)}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parseDateInputValue(event.target.value))
              }
              ref={field.ref}
              disabled={isLoading || viewOnly || durationPreset !== "custom"}
              aria-readonly={durationPreset !== "custom"}
              title={
                durationPreset === "custom"
                  ? "Set the sprint end date manually."
                  : "End date is auto-calculated from the selected duration."
              }
              className={
                durationPreset === "custom"
                  ? undefined
                  : "cursor-not-allowed bg-muted/40 text-muted-foreground disabled:opacity-100"
              }
            />
            <FieldDescription className="text-xs">
              {durationPreset === "custom"
                ? "Set the sprint end date manually."
                : "End date is locked and recalculates automatically from the selected duration."}
            </FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <SprintHoursPerDayField form={form} isLoading={isLoading} viewOnly={viewOnly} />

      <Controller
        name="sprintDuration"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Duration (Days)</FieldLabel>
            <Input
              type="number"
              {...field}
              value={computedDuration}
              readOnly
              aria-readonly="true"
              disabled={isLoading || viewOnly}
              className="bg-muted/40 text-muted-foreground"
            />
            <FieldDescription className="text-xs">
              {startDate && endDate
                ? "Calculated from working weekdays minus day-offs."
                : "Set the sprint date range to enable holiday/day-off scheduling."}
            </FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
    </>
  )
}
