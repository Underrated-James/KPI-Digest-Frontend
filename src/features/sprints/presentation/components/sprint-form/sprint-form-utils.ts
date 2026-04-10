"use client"

export interface SprintDayOffInput {
  date: string
}

function normalizeDateToUtc(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function isValidDateValue(
  date: Date | null | undefined,
): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

export function parseDateInputValue(value: string) {
  if (!value) {
    return undefined
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return isValidDateValue(parsedDate) ? parsedDate : undefined
}

export function toDateInputValue(date: Date | null | undefined) {
  return isValidDateValue(date) ? date.toISOString().split("T")[0] : ""
}

export function isDayOffDateWithinRange(
  date: string,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
) {
  if (!isValidDateValue(startDate) || !isValidDateValue(endDate)) {
    return false
  }

  const parsedDayOffDate = parseDateInputValue(date)
  if (!parsedDayOffDate) {
    return false
  }

  const normalizedDayOffDate = normalizeDateToUtc(parsedDayOffDate)
  const start = normalizeDateToUtc(startDate)
  const end = normalizeDateToUtc(endDate)

  return (
    normalizedDayOffDate.getTime() >= start.getTime() &&
    normalizedDayOffDate.getTime() <= end.getTime()
  )
}

export function calculateWorkingDays(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  dayOffs: SprintDayOffInput[],
) {
  if (!isValidDateValue(startDate) || !isValidDateValue(endDate)) {
    return 0
  }

  const start = normalizeDateToUtc(startDate)
  const end = normalizeDateToUtc(endDate)

  if (end.getTime() <= start.getTime()) {
    return 0
  }

  const validDayOffDates = new Set(
    dayOffs
      .map((dayOff) => dayOff.date)
      .filter((dateStr) => isDayOffDateWithinRange(dateStr, start, end)),
  )

  let workingDaysCount = 0
  const currentDate = new Date(start.getTime())

  while (currentDate.getTime() <= end.getTime()) {
    const dayOfWeek = currentDate.getUTCDay()
    const dateKey = currentDate.toISOString().split("T")[0]

    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6 &&
      !validDayOffDates.has(dateKey)
    ) {
      workingDaysCount += 1
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return workingDaysCount
}

export function calculateSprintDurationDays(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  dayOffs: SprintDayOffInput[],
) {
  return calculateWorkingDays(startDate, endDate, dayOffs)
}
