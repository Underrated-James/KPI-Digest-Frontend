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
import { User, CreateUserDTO, UserRole } from "../../domain/types/user-types"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(["ADMIN", "DEVS", "QA"]),
  status: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>

interface UserFormProps {
  initialData?: User
  onSubmit: (data: CreateUserDTO) => void
  isLoading: boolean
  onCancel: () => void
}

export function UserForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: UserFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      role: (initialData?.role as UserRole) ?? "DEVS",
      status: initialData?.status ?? true,
    },
  })

  const isUpdateMode = Boolean(initialData)
  const isUnchangedUpdate = isUpdateMode && !form.formState.isDirty

  const handleSubmit = (data: FormValues) => {
    if (isUnchangedUpdate) {
      return
    }

    onSubmit({
      ...data,
      status: isUpdateMode ? data.status : true,
    } as CreateUserDTO)
  }

  return (
    <Card className="w-full border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-w-md">
      <CardHeader className="border-b border-border/80 pb-5">
        <CardTitle>{initialData ? "Edit User" : "Create User"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details for this user, including whether they are active."
            : "Fill in the details to add a new user."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form id="user-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-name">Full Name</FieldLabel>
                  <Input
                    {...field}
                    id="user-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-email">Email Address</FieldLabel>
                  <Input
                    {...field}
                    id="user-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
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
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-role">Role</FieldLabel>
                  <div className="relative">
                    <select
                      {...field}
                      id="user-role"
                      disabled={isLoading}
                      className="flex h-10 w-full appearance-none cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="DEVS">Developer</option>
                      <option value="QA">QA Engineer</option>
                      <option value="ADMIN">Administrator</option>
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

            {isUpdateMode && (
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-status">Status</FieldLabel>
                    <div className="relative">
                      <select
                        id="user-status"
                        value={field.value ? "active" : "inactive"}
                        onChange={(event) =>
                          field.onChange(event.target.value === "active")
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        disabled={isLoading}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">
                          Active
                        </option>
                        <option value="inactive">
                          Inactive
                        </option>
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
            )}
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
            form="user-form"
            disabled={isLoading || isUnchangedUpdate}
          >
            {isLoading ? "Saving..." : initialData ? "Update User" : "Create User"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
