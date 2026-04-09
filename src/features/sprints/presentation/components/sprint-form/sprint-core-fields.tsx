"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SprintFormValues } from "./sprint-form-schema"

interface SprintCoreFieldsProps {
  form: UseFormReturn<SprintFormValues>
  isLoading: boolean
  computedDuration: number
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
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
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

      <Controller
        name="workingHoursDay"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Hrs/Day</FieldLabel>
            <Input
              type="number"
              step="0.5"
              value={Number.isNaN(field.value) ? "" : field.value}
              onChange={(event) => {
                const nextValue = event.target.value
                field.onChange(nextValue === "" ? undefined : Number(nextValue))
              }}
              disabled={isLoading}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="sprintDuration"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Duration (Days)</FieldLabel>
            <Input
              type="number"
              {...field}
              value={field.value ?? computedDuration}
              readOnly
              aria-readonly="true"
              disabled={isLoading}
              className="bg-muted/40 text-muted-foreground"
            />
            <FieldDescription>
              Calculated from working weekdays minus day-offs.
            </FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
    </>
  )
}
