import {
  CreateTeamDTO,
  PaginatedData,
  UpdateTeamDTO,
  Team,
  TeamQueryParams,
} from "../types/team-types";

export interface TeamRepository {
  getTeams(params?: TeamQueryParams): Promise<PaginatedData<Team>>;
  getTeamById(id: string): Promise<Team>;
  createTeam(data: CreateTeamDTO): Promise<Team>;
  updateTeam(id: string, data: UpdateTeamDTO): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
}
