import api from "./axios-instance";
import {
  BackendResponse,
  CreateTeamDTO,
  PaginatedData,
  UpdateTeamDTO,
  Team,
  TeamQueryParams,
} from "../../domain/types/team-types";

type TeamApiRecord = Team & {
  _id?: string;
};

function normalizeTeam(team: any): Team {
  const users = Array.isArray(team.users) ? team.users : (Array.isArray(team.userIds) ? team.userIds : []);
  return {
    ...team,
    id: team.id ?? team._id ?? "",
    users: users.map((u: any) => ({
      ...u,
      userId: u.userId || u.id || ""
    })),
  };
}

function normalizeTeamPage(page: PaginatedData<TeamApiRecord>): PaginatedData<Team> {
  return {
    ...page,
    content: page.content.map(normalizeTeam),
  };
}

export const teamApi = {
  async getTeams(params?: TeamQueryParams): Promise<PaginatedData<Team>> {
    const { data } = await api.get<BackendResponse<PaginatedData<Team>>>(
      "/teams",
      { params }
    );

    return normalizeTeamPage(data.data as PaginatedData<TeamApiRecord>);
  },

  async getTeamById(id: string): Promise<Team> {
    const { data } = await api.get<BackendResponse<TeamApiRecord>>(`/teams/${id}`);

    return normalizeTeam(data.data);
  },

  async createTeam(teamData: CreateTeamDTO): Promise<Team> {
    const { data } = await api.post<BackendResponse<TeamApiRecord>>("/teams", teamData);

    return normalizeTeam(data.data);
  },

  async updateTeam(id: string, teamData: UpdateTeamDTO): Promise<Team> {
    const { data } = await api.patch<BackendResponse<TeamApiRecord>>(
      `/teams/${id}`,
      teamData
    );

    return normalizeTeam(data.data);
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};
