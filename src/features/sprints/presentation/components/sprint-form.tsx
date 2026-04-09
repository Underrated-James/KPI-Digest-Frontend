"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CreateSprintDTO, Sprint } from "../../domain/types/sprint-types"
import {
  createSprintFormDefaultValues,
  sprintFormSchema,
  toCreateSprintPayload,
  type SprintFormValues,
} from "./sprint-form/sprint-form-schema"
import { SprintCoreFields } from "./sprint-form/sprint-core-fields"
import { SprintDayOffSection } from "./sprint-form/sprint-day-off-section"
import { SprintProjectField } from "./sprint-form/sprint-project-field"
import { calculateSprintDurationDays } from "./sprint-form/sprint-form-utils"

interface SprintFormProps {
  initialData?: Sprint
  onSubmit: (data: CreateSprintDTO) => void
  isLoading: boolean
  onCancel: () => void
}

export function SprintForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: SprintFormProps) {
  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: createSprintFormDefaultValues(initialData),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dayOff",
  })

  const [startDate, endDate, dayOffs] = useWatch({
    control: form.control,
    name: ["startDate", "endDate", "dayOff"],
  })

  const isUpdateMode = Boolean(initialData)
  const isUnchangedUpdate = isUpdateMode && !form.formState.isDirty

  const computedDuration = useMemo(
    () => calculateSprintDurationDays(startDate, endDate, dayOffs ?? []),
    [dayOffs, endDate, startDate],
  )

  useEffect(() => {
    if (form.getValues("sprintDuration") === computedDuration) {
      return
    }

    form.setValue("sprintDuration", computedDuration, {
      shouldDirty: false,
      shouldValidate: form.formState.isSubmitted,
    })
  }, [computedDuration, form, form.formState.isSubmitted])

  const handleSubmit = (data: SprintFormValues) => {
    if (isUnchangedUpdate) {
      return
    }

    onSubmit(toCreateSprintPayload(data))
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border border-border bg-card shadow-xl ring-1 ring-border/70">
      <CardHeader className="border-b border-border/80 pb-5 text-center">
        <CardTitle>{initialData ? "Edit Sprint" : "Create New Sprint"}</CardTitle>
        <CardDescription>
          Configure your sprint details, schedule, and team working hours.
        </CardDescription>
      </CardHeader>

      <CardContent
        className={cn(
          "px-8 pt-6",
          fields.length > 0 && "max-h-[70vh] overflow-y-auto",
        )}
      >
        <form
          id="sprint-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SprintProjectField form={form} isLoading={isLoading} />
            <SprintCoreFields
              form={form}
              isLoading={isLoading}
              computedDuration={computedDuration}
            />
          </div>

          <SprintDayOffSection
            form={form}
            fields={fields}
            isLoading={isLoading}
            onAppend={() => append({ label: "", date: "" })}
            onRemove={remove}
          />
        </form>
      </CardContent>

      <CardFooter className="border-t border-border/80 bg-muted/30 px-8">
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="hover:bg-muted"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="sprint-form"
            className="px-8"
            disabled={isLoading || isUnchangedUpdate}
          >
            {isLoading ? "Saving..." : initialData ? "Update Sprint" : "Create Sprint"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
