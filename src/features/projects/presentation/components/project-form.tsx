"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
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
import { Project, CreateProjectDTO } from "../../domain/types/project-types"
import { useProjectById } from "../hooks/use-project-by-id"
import { useUsers } from "@/features/users/presentation/hooks/use-users"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  projectCode: z
    .string()
    .trim()
    .min(2, "Project code must be at least 2 characters.")
    .max(10, "Project code must not exceed 10 characters."),
  status: z.enum(["active", "inactive", "inProgress"]),
  finishDate: z.date({
    message: "Target finish date is required.",
  }),
  memberIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>

function buildDefaultValues(project?: Project): FormValues {
  return {
    name: project?.name ?? "",
    projectCode: project?.projectCode ?? "",
    status: project?.status ?? "active",
    finishDate: project?.finishDate ? new Date(project.finishDate) : new Date(),
    memberIds: project?.members?.map((member) => member.id) ?? [],
  }
}

interface ProjectFormProps {
  initialData?: Project
  onSubmit: (data: CreateProjectDTO) => void
  isLoading: boolean
  onCancel: () => void
}

export function ProjectForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: ProjectFormProps) {
  const { data: projectDetail } = useProjectById(initialData?.id ?? null)
  const projectForForm = projectDetail ?? initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(projectForForm),
  })

  useEffect(() => {
    form.reset(buildDefaultValues(projectForForm))
  }, [form, projectForForm])

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ size: 100 })
  const availableMembers = (usersData?.users ?? []).filter(
    (user) => user.role !== "ADMIN"
  )

  const isUpdateMode = Boolean(initialData)
  const isUnchangedUpdate = isUpdateMode && !form.formState.isDirty

  const handleSubmit = (data: FormValues) => {
    if (isUnchangedUpdate) {
      return
    }

    const payload: CreateProjectDTO = {
      ...data,
      projectCode: data.projectCode.trim(),
      finishDate: data.finishDate.toISOString(),
      memberIds: data.memberIds,
    };

    onSubmit(payload)
  }

  return (
    <Card className="w-full border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-w-md">
      <CardHeader className="border-b border-border/80 pb-5">
        <CardTitle>{initialData ? "Edit Project" : "Create Project"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details for this project, including its status and target finish date."
            : "Fill in the details to add a new project."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form id="project-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-name">Project Name</FieldLabel>
                  <Input
                    {...field}
                    id="project-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter project name"
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
              name="projectCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-code">Project Code</FieldLabel>
                  <Input
                    {...field}
                    id="project-code"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter project code"
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
                  <FieldLabel htmlFor="project-finish-date">Target Finish Date</FieldLabel>
                  <Input
                    {...field}
                    id="project-finish-date"
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

            <Controller
              name="memberIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Project Members</FieldLabel>
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-border bg-background p-3">
                    {isLoadingUsers ? (
                      <p className="text-sm text-muted-foreground">
                        Loading members...
                      </p>
                    ) : availableMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No eligible users available.
                      </p>
                    ) : (
                      availableMembers.map((user) => {
                        const checked = field.value.includes(user.id)

                        return (
                          <label
                            key={user.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 hover:border-border hover:bg-muted/40"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {user.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {user.email} • {user.role}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  field.onChange([...field.value, user.id])
                                  return
                                }

                                field.onChange(
                                  field.value.filter((value) => value !== user.id)
                                )
                              }}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-border"
                            />
                          </label>
                        )
                      })
                    )}
                  </div>
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
            form="project-form"
            disabled={isLoading || isUnchangedUpdate}
          >
            {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
