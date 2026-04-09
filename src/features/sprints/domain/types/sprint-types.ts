export type SprintStatus = 'active' | 'inactive' | 'draft' | 'completed';

export interface DayOff {
    label: string;
    date: string; 
}

export interface Sprint {
    id: string;
    projectId: string;
    projectName?: string;
    name: string;
    status: SprintStatus;
    startDate: string;
    officialStartDate: string | null;
    endDate: string;
    officialEndDate: string | null;
    workingHoursDay: number;
    sprintDuration: number;
    dayOff: DayOff[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateSprintDTO {
    projectId: string;
    name: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
    workingHoursDay: number;
    sprintDuration: number;
    dayOff: DayOff[];
    officialStartDate?: string | null;
    officialEndDate?: string | null;
}

export type UpdateSprintDTO = Partial<CreateSprintDTO>;

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

export interface SprintQueryParams {
    page?: number;
    size?: number;
    search?: string;
    status?: SprintStatus;
    projectId?: string;
}
