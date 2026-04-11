"use client"

import { useFieldArray, type UseFormReturn, Controller } from "react-hook-form"
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useUsers } from "@/features/users/presentation/hooks/use-users"
import { User } from "@/features/users/domain/types/user-types"
import type { TeamFormValues } from "./team-form-schema"
import { useState } from "react"

interface TeamUserSectionProps {
  form: UseFormReturn<TeamFormValues>
  isLoading: boolean
}

export function TeamUserSection({
  form,
  isLoading,
}: TeamUserSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "userIds",
  })

  const { data: usersData } = useUsers({ size: 100 })
  const users = usersData?.users ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FieldLabel className="text-base font-semibold">Team Members</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({
            userId: "",
            allocationPercentage: 100,
            hoursPerDay: 8,
            role: "DEVS",
            leave: [],
          })}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-12"
          >
            <div className="sm:col-span-4">
              <UserSelector
                form={form}
                index={index}
                users={users}
                isLoading={isLoading}
              />
            </div>

            <div className="sm:col-span-2">
              <Field>
                <FieldLabel className="text-xs">Allocation (%)</FieldLabel>
                <Input
                  type="number"
                  {...form.register(`userIds.${index}.allocationPercentage`, { valueAsNumber: true })}
                  placeholder="100"
                  disabled={isLoading}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field>
                <FieldLabel className="text-xs">Hours/Day</FieldLabel>
                <Input
                  type="number"
                  {...form.register(`userIds.${index}.hoursPerDay`, { valueAsNumber: true })}
                  placeholder="8"
                  disabled={isLoading}
                />
              </Field>
            </div>

            <div className="sm:col-span-3">
              <Field>
                <FieldLabel className="text-xs">Role</FieldLabel>
                <Controller
                  name={`userIds.${index}.role`}
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="DEVS">DEVS</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="flex items-end justify-end sm:col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => remove(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            No members added yet.
          </div>
        )}

        {form.formState.errors.userIds?.message && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.userIds.message}
          </p>
        )}
      </div>
    </div>
  )
}

function UserSelector({
  form,
  index,
  users,
  isLoading,
}: {
  form: UseFormReturn<TeamFormValues>
  index: number
  users: User[]
  isLoading: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <Controller
      name={`userIds.${index}.userId`}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel className="text-xs">User</FieldLabel>
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
                  ? users.find((user) => user.id === field.value)?.name
                  : "Select user..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search user..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => {
                          field.onChange(user.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
  )
}
