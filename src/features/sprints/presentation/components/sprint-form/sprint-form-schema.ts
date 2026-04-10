"use client"

import * as z from "zod"
import type { CreateSprintDTO, Sprint } from "../../../domain/types/sprint-types"
import { calculateWorkingDays, isDayOffDateWithinRange } from "./sprint-form-utils"

const sprintDayOffSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  date: z.string().min(1, "Date is required"),
})

export const sprintFormSchema = z
  .object({
    projectId: z.string().min(1, "Project is required."),
    name: z.string().min(2, "Name must be at least 2 characters."),
    status: z.enum(["active", "inactive", "draft", "completed"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    workingHoursDay: z.number().min(1).max(24),
    sprintDuration: z.number().min(0),
    officialStartDate: z.date().optional().nullable(),
    officialEndDate: z.date().optional().nullable(),
    dayOff: z.array(sprintDayOffSchema),
  })
  .superRefine((values, context) => {
    if (!(values.startDate instanceof Date) || Number.isNaN(values.startDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required.",
        path: ["startDate"],
      })
      return
    }

    if (!(values.endDate instanceof Date) || Number.isNaN(values.endDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required.",
        path: ["endDate"],
      })
      return
    }

    if (values.endDate.getTime() <= values.startDate.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be at least 1 day after the start date.",
        path: ["endDate"],
      })
      return
    }

    values.dayOff.forEach((dayOff, index) => {
      if (
        !isDayOffDateWithinRange(dayOff.date, values.startDate, values.endDate)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Holiday date must be within the sprint date range.",
          path: ["dayOff", index, "date"],
        })
      }
    })

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
      : undefined,
    endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
    workingHoursDay: initialData?.workingHoursDay ?? 8,
    sprintDuration: initialData?.sprintDuration ?? 0,
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
  if (!(data.startDate instanceof Date) || !(data.endDate instanceof Date)) {
    throw new Error("Sprint start and end dates are required before submission.")
  }

  return {
    ...data,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    officialStartDate: data.officialStartDate?.toISOString() ?? null,
    officialEndDate: data.officialEndDate?.toISOString() ?? null,
  }
}
