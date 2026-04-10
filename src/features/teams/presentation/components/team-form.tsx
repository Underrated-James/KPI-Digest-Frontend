"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Team, CreateTeamDTO } from "../../domain/types/team-types"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  status: z.enum(["active", "inactive", "inProgress"]),
  finishDate: z.date({
    message: "Finish date is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>

interface TeamFormProps {
  initialData?: Team
  onSubmit: (data: CreateTeamDTO) => void
  isLoading: boolean
  onCancel: () => void
}

export function TeamForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: TeamFormProps) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      status: initialData?.status ?? "active",
      finishDate: initialData?.finishDate ? new Date(initialData.finishDate) : new Date(),
    },
  })

  const isUpdateMode = Boolean(initialData)
  const isUnchangedUpdate = isUpdateMode && !form.formState.isDirty

  const handleSubmit = (data: FormValues) => {
    if (isUnchangedUpdate) {
      return
    }

    const payload: CreateTeamDTO = {
      ...data,
      finishDate: data.finishDate.toISOString(),
    };

    onSubmit(payload)
  }

  return (
    <Card className="w-full border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-w-md">
      <CardHeader className="border-b border-border/80 pb-5">
        <CardTitle>{initialData ? "Edit Team" : "Create Team"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details for this team, including its status and finish date."
            : "Fill in the details to add a new team."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form id="team-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="team-name">Team Name</FieldLabel>
                  <Input
                    {...field}
                    id="team-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter team name"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-status">Status</FieldLabel>
                  <div className="relative">
                    <select
                      {...field}
                      id="project-status"
                      disabled={isLoading}
                      className="flex h-10 w-full appearance-none cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inProgress">In Progress</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="finishDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="team-finish-date">Finish Date</FieldLabel>
                  <Input
                    {...field}
                    id="team-finish-date"
                    type="date"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t border-border/80 bg-muted/30">
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="hover:border-foreground/35 hover:bg-foreground/10 hover:text-foreground dark:hover:border-foreground/35 dark:hover:bg-foreground/15 dark:hover:text-foreground"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="team-form"
            disabled={isLoading || isUnchangedUpdate}
          >
            {isLoading ? "Saving..." : initialData ? "Update Team" : "Create Team"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
