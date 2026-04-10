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
import { useProjects } from "../../../../projects/presentation/hooks/use-projects"
import type { SprintFormValues } from "./sprint-form-schema"

interface SprintProjectFieldProps {
  form: UseFormReturn<SprintFormValues>
  isLoading: boolean
}

export function SprintProjectField({
  form,
  isLoading,
}: SprintProjectFieldProps) {
  const [open, setOpen] = useState(false)
  const { data: projectsData } = useProjects({ size: 100 })
  const projects = projectsData?.content ?? []

  return (
    <Controller
      name="projectId"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="col-span-full">
          <FieldLabel>Select Project</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                disabled={isLoading}
              >
                {field.value
                  ? projects.find((project) => project.id === field.value)?.name
                  : "Search projects..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search project name..." />
                <CommandList>
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => {
                          form.setValue("projectId", project.id, {
                            shouldDirty: true,
                          })
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === project.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {project.name}
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
