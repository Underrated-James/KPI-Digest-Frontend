import { TeamRepository } from "../../domain/repositories/team-repositories";
import {
  CreateTeamDTO,
  UpdateTeamDTO,
  TeamQueryParams,
} from "../../domain/types/team-types";
import { teamApi } from "../api/team-api";

export class TeamRepositoryImpl implements TeamRepository {
  async getTeams(params?: TeamQueryParams) {
    return teamApi.getTeams(params);
  }

  async getTeamById(id: string) {
    return teamApi.getTeamById(id);
  }

  async createTeam(data: CreateTeamDTO) {
    return teamApi.createTeam(data);
  }

  async updateTeam(id: string, data: UpdateTeamDTO) {
    return teamApi.updateTeam(id, data);
  }

  async deleteTeam(id: string) {
    await teamApi.deleteTeam(id);
  }
}
