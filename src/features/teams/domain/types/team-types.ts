import { ProjectStatus } from "@/features/projects/domain/types/project-types";
import { SprintStatus } from "@/features/sprints/domain/types/sprint-types";
import { UserRole } from "@/features/users/domain/types/user-types";

export interface ListOfUsers {
    userId: string;
    name?: string;
    allocationPercentage: number;
    hoursPerDay: number;
    role: UserRole;
    leave?: LeaveDays[];
}

export interface LeaveDays {
    leaveType: LeaveType[];
    leaveDate: string;
}

export enum LeaveType {
    SICK_LEAVE = 'sick',
    VACATION_LEAVE = 'vacation',
    WHOLE_DAY_LEAVE = 'wholeDayLeave',
    HALF_DAY_LEAVE = 'halfDayLeave',
    OTHER_LEAVE = 'other',
}

export interface Team {
    id: string;
    projectId: string;
    projectName?: string;
    projectStatus: ProjectStatus;
    sprintId: string;
    sprintName?: string;
    sprintStatus: SprintStatus;
    users: ListOfUsers[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateTeamDTO {
    projectId: string;
    sprintId: string;
    userIds: ListOfUsers[];
}

export type UpdateTeamDTO = Partial<CreateTeamDTO>;

export interface BackendResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface PaginatedData<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    numberOfElements: number;
    firstPage: boolean;
    lastPage: boolean;
}

export interface TeamQueryParams {
    page?: number;
    size?: number;
    search?: string;
    status?: SprintStatus;
    projectId?: string;
    sprintId?: string;
}
