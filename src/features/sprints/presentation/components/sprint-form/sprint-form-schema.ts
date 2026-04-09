"use client"

import * as z from "zod"
import type { CreateSprintDTO, Sprint } from "../../../domain/types/sprint-types"
import { calculateWorkingDays } from "./sprint-form-utils"

const sprintDayOffSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  date: z.string().min(1, "Date is required"),
})

export const sprintFormSchema = z
  .object({
    projectId: z.string().min(1, "Project is required."),
    name: z.string().min(2, "Name must be at least 2 characters."),
    status: z.enum(["active", "inactive", "draft", "completed"]),
    startDate: z.date({ message: "Start date is required." }),
    endDate: z.date({ message: "End date is required." }),
    workingHoursDay: z.number().min(1).max(24),
    sprintDuration: z.number().min(0),
    officialStartDate: z.date().optional().nullable(),
    officialEndDate: z.date().optional().nullable(),
    dayOff: z.array(sprintDayOffSchema),
  })
  .superRefine((values, context) => {
    if (values.endDate.getTime() <= values.startDate.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be at least 1 day after the start date.",
        path: ["endDate"],
      })
      return
    }

    if (
      calculateWorkingDays(values.startDate, values.endDate, values.dayOff) < 2
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sprint must have at least 2 working weekdays after days off.",
        path: ["dayOff"],
      })
    }
  })

export type SprintFormValues = z.infer<typeof sprintFormSchema>

export function createSprintFormDefaultValues(
  initialData?: Sprint,
): SprintFormValues {
  return {
    projectId: initialData?.projectId ?? "",
    name: initialData?.name ?? "",
    status: initialData?.status ?? "draft",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate)
      : new Date(),
    endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(),
    workingHoursDay: initialData?.workingHoursDay ?? 8,
    sprintDuration: initialData?.sprintDuration ?? 2,
    officialStartDate: initialData?.officialStartDate
      ? new Date(initialData.officialStartDate)
      : null,
    officialEndDate: initialData?.officialEndDate
      ? new Date(initialData.officialEndDate)
      : null,
    dayOff: initialData?.dayOff ?? [],
  }
}

export function toCreateSprintPayload(
  data: SprintFormValues,
): CreateSprintDTO {
  return {
    ...data,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    officialStartDate: data.officialStartDate?.toISOString() ?? null,
    officialEndDate: data.officialEndDate?.toISOString() ?? null,
  }
}
