"use client"

import { useEffect, useState } from "react"
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

interface SprintCoreFieldsProps {
  form: UseFormReturn<SprintFormValues>
  isLoading: boolean
  computedDuration: number
}

function SprintHoursPerDayField({
  form,
  isLoading,
}: Pick<SprintCoreFieldsProps, "form" | "isLoading">) {
  const { field, fieldState } = useController({
    control: form.control,
    name: "workingHoursDay",
  })
  const [inputValue, setInputValue] = useState(
    field.value === undefined || field.value === null ? "" : String(field.value),
  )

  useEffect(() => {
    setInputValue(
      field.value === undefined || field.value === null ? "" : String(field.value),
    )
  }, [field.value])

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
      <FieldLabel>Hrs/Day</FieldLabel>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => stepValue(-0.5)}
          disabled={isLoading}
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
          disabled={isLoading}
          className="text-left"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => stepValue(0.5)}
          disabled={isLoading}
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
}: SprintCoreFieldsProps) {
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
              disabled={isLoading}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Status</FieldLabel>
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
              value={
                field.value instanceof Date
                  ? field.value.toISOString().split("T")[0]
                  : ""
              }
              onChange={(event) => field.onChange(new Date(event.target.value))}
              disabled={isLoading}
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
              value={
                field.value instanceof Date
                  ? field.value.toISOString().split("T")[0]
                  : ""
              }
              onChange={(event) => field.onChange(new Date(event.target.value))}
              disabled={isLoading}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <SprintHoursPerDayField form={form} isLoading={isLoading} />

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
              disabled={isLoading}
              className="bg-muted/40 text-muted-foreground"
            />
            <FieldDescription className="text-xs">
              Calculated from working weekdays minus day-offs.
            </FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
    </>
  )
}
