"use client"

import { useState } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useSprints } from "@/features/sprints/presentation/hooks/use-sprints"
import type { TeamFormValues } from "./team-form-schema"

interface TeamSprintFieldProps {
  form: UseFormReturn<TeamFormValues>
  isLoading: boolean
  projectId: string
}

export function TeamSprintField({
  form,
  isLoading,
  projectId,
}: TeamSprintFieldProps) {
  const [open, setOpen] = useState(false)
  const { data: sprintsData } = useSprints({ projectId, size: 100 }, !!projectId)
  const sprints = sprintsData?.content ?? []

  return (
    <Controller
      name="sprintId"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="col-span-full">
          <FieldLabel>Select Sprint</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                disabled={isLoading || !projectId}
              >
                {field.value
                  ? sprints.find((sprint) => sprint.id === field.value)?.name
                  : "Search sprints..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search sprint name..." />
                <CommandList>
                  <CommandEmpty>No sprint found.</CommandEmpty>
                  <CommandGroup>
                    {sprints.map((sprint) => (
                      <CommandItem
                        key={sprint.id}
                        value={sprint.name}
                        onSelect={() => {
                          form.setValue("sprintId", sprint.id, {
                            shouldDirty: true,
                          })
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === sprint.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {sprint.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  )
}
