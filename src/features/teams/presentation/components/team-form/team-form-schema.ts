"use client"

import * as z from "zod"
import {
  LeaveType,
  Team,
  CreateTeamDTO,
  ListOfUsers,
} from "../../../domain/types/team-types"

const leaveDaySchema = z.object({
  leaveType: z.array(z.nativeEnum(LeaveType)),
  leaveDate: z.string().min(1, "Date is required"),
});

const teamUserSchema = z.object({
  userId: z.string().min(1, "User is required"),
  allocationPercentage: z.number().min(0).max(100),
  hoursPerDay: z.number().min(0).max(24),
  role: z.enum(["ADMIN", "DEVS", "QA"]),
  leave: z.array(leaveDaySchema).optional(),
});

export const teamFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  sprintId: z.string().min(1, "Sprint is required"),
  userIds: z.array(teamUserSchema).min(1, "At least one member is required"),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>

type TeamFormMemberInput = Partial<ListOfUsers> & {
  id?: string
}

type TeamFormInitialData = Partial<Omit<Team, "users">> & {
  users?: TeamFormMemberInput[]
  userIds?: TeamFormMemberInput[]
}

export function createTeamFormDefaultValues(
  initialData?: TeamFormInitialData
): TeamFormValues {
  // The backend might return 'users' or 'userIds' depending on the endpoint or normalization
  const members = initialData?.users || initialData?.userIds || [];
  
  return {
    projectId: initialData?.projectId ?? "",
    sprintId: initialData?.sprintId ?? "",
    userIds: Array.isArray(members) 
      ? members.map((user) => ({
          userId: user.userId ?? user.id ?? "",
          allocationPercentage: user.allocationPercentage ?? 100,
          hoursPerDay: user.hoursPerDay ?? 8,
          role: user.role ?? "DEVS",
          leave: user.leave ?? [],
        })) 
      : [],
  }
}

export function toCreateTeamPayload(values: TeamFormValues): CreateTeamDTO {
  return {
    projectId: values.projectId,
    sprintId: values.sprintId,
    userIds: values.userIds,
  }
}
