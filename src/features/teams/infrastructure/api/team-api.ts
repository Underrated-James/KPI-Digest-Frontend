import api from "./axios-instance";
import {
  BackendResponse,
  CreateTeamDTO,
  PaginatedData,
  UpdateTeamDTO,
  Team,
  TeamQueryParams,
} from "../../domain/types/team-types";

export const teamApi = {
  async getTeams(params?: TeamQueryParams): Promise<PaginatedData<Team>> {
    const { data } = await api.get<BackendResponse<PaginatedData<Team>>>(
      "/teams",
      { params }
    );

    return data.data;
  },

  async getTeamById(id: string): Promise<Team> {
    const { data } = await api.get<BackendResponse<Team>>(`/teams/${id}`);

    return data.data;
  },

  async createTeam(teamData: CreateTeamDTO): Promise<Team> {
    const { data } = await api.post<BackendResponse<Team>>("/teams", teamData);

    return data.data;
  },

  async updateTeam(id: string, teamData: UpdateTeamDTO): Promise<Team> {
    const { data } = await api.patch<BackendResponse<Team>>(
      `/teams/${id}`,
      teamData
    );

    return data.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};
