import * as React from "react"
import { cn } from "@/lib/utils"

type FieldProps = React.HTMLAttributes<HTMLDivElement>
type FieldErrorValue =
  | string
  | number
  | React.ReactNode
  | { message?: React.ReactNode | string | number | null }

function isFieldErrorMessageObject(
  error: FieldErrorValue,
): error is { message?: React.ReactNode | string | number | null } {
  return typeof error === "object" && error !== null && "message" in error
}

function getFieldErrorMessage(error: FieldErrorValue): React.ReactNode {
  if (isFieldErrorMessageObject(error)) {
    return error.message ?? null
  }

  return error
}

export function Field({ className, ...props }: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FieldError({
  errors,
  className,
  ...props
}: {
  errors: FieldErrorValue[]
} & React.HTMLAttributes<HTMLParagraphElement>) {
  if (!errors || errors.length === 0) return null
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {errors.map((error, index) => (
        <p key={index} className="text-[0.8rem] font-medium text-destructive">
          {getFieldErrorMessage(error)}
        </p>
      ))}
    </div>
  )
}
