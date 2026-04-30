"use client"

import { useEffect } from "react"
import { Trash2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Team, CreateTeamDTO } from "../../domain/types/team-types"
import {
  teamFormSchema,
  createTeamFormDefaultValues,
  toCreateTeamPayload,
  TeamFormValues,
} from "./team-form/team-form-schema"
import { TeamProjectField } from "./team-form/team-project-field"
import { TeamSprintField } from "./team-form/team-sprint-field"
import { TeamUserSection } from "./team-form/team-user-section"

interface TeamFormProps {
  initialData?: Team
  onSubmit: (data: CreateTeamDTO) => void
  onDelete?: (id: string) => void
  isLoading: boolean
  isDeleting?: boolean
  onCancel: () => void
}

export function TeamForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
  onCancel,
}: TeamFormProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: createTeamFormDefaultValues(initialData),
  })

  // Reset form when initialData changes (e.g. when opening edit form)
  useEffect(() => {
    if (initialData) {
      form.reset(createTeamFormDefaultValues(initialData))
    }
  }, [initialData, form])

  const projectId = useWatch({
    control: form.control,
    name: "projectId",
  })
  const isUpdateMode = Boolean(initialData)
  const isUnchangedUpdate = isUpdateMode && !form.formState.isDirty

  const handleSubmit = (values: TeamFormValues) => {
    if (isUnchangedUpdate) {
      return
    }

    onSubmit(toCreateTeamPayload(values))
  }

  return (
    <Card className="w-full border border-border bg-card shadow-xl ring-1 ring-border/70 sm:max-w-4xl">
      <CardHeader className="border-b border-border/80 pb-5">
        <CardTitle>{initialData ? "Edit Team" : "Create Team"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details for this team, including its members and status."
            : "Fill in the details to add a new team."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 overflow-y-auto max-h-[60vh]">
        <form id="team-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TeamProjectField form={form} isLoading={isLoading} />
            <TeamSprintField form={form} isLoading={isLoading} projectId={projectId} />
          </div>

          <TeamUserSection form={form} isLoading={isLoading} />
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/80 pt-5">
        <div>
          {initialData && onDelete && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(initialData.id)}
              disabled={isLoading || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="team-form"
            disabled={isLoading || isDeleting || isUnchangedUpdate}
          >
            {isLoading ? "Saving..." : initialData ? "Update Team" : "Create Team"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
