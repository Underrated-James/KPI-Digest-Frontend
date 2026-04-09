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
    <Card className="mx-auto flex h-full w-full max-w-7xl max-h-[calc(100vh-2rem)] border border-border bg-card shadow-xl ring-1 ring-border/70">
      <CardHeader className="border-b border-border/80 pb-4 text-center">
        <CardTitle>{initialData ? "Edit Sprint" : "Create New Sprint"}</CardTitle>
        <CardDescription>
          Configure your sprint details, schedule, and team working hours.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-hidden px-5 pt-5 sm:px-6">
        <form
          id="sprint-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex h-full min-h-0 flex-col space-y-5"
        >
          <div className="grid flex-1 min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(460px,1.05fr)] xl:gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SprintProjectField form={form} isLoading={isLoading} />
                <SprintCoreFields
                  form={form}
                  isLoading={isLoading}
                  computedDuration={computedDuration}
                />
              </div>
            </div>

            <div className="lg:self-stretch">
              <SprintDayOffSection
                form={form}
                fields={fields}
                isLoading={isLoading}
                onAppend={() => append({ label: "", date: "" })}
                onRemove={remove}
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-border/80 bg-muted/30 px-5 py-4 sm:px-6">
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
