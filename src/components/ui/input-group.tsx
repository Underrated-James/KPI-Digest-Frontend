import * as React from "react"
import { cn } from "@/lib/utils"

export function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

export function InputGroupAddon({ align, className, ...props }: { align?: "block-start" | "block-end" } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "absolute right-2",
        align === "block-end" ? "bottom-2" : "top-2",
        className
      )}
      {...props}
    />
  )
}

export function InputGroupText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export function InputGroupTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
