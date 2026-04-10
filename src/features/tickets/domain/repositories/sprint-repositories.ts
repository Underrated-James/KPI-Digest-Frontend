import {
  CreateSprintDTO,
  PaginatedData,
  UpdateSprintDTO,
  Sprint,
  SprintQueryParams,
} from "../types/sprint-types";

export interface SprintRepository {
  getSprints(params?: SprintQueryParams): Promise<PaginatedData<Sprint>>;
  getSprintById(id: string): Promise<Sprint>;
  createSprint(data: CreateSprintDTO): Promise<Sprint>;
  updateSprint(id: string, data: UpdateSprintDTO): Promise<Sprint>;
  deleteSprint(id: string): Promise<void>;
}
