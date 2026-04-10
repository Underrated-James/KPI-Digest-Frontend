import { SprintRepository } from "../../domain/repositories/sprint-repositories";
import {
  CreateSprintDTO,
  UpdateSprintDTO,
  SprintQueryParams,
} from "../../domain/types/sprint-types";
import { sprintApi } from "../api/sprint-api";

export class SprintRepositoryImpl implements SprintRepository {
  async getSprints(params?: SprintQueryParams) {
    return sprintApi.getSprints(params);
  }

  async getSprintById(id: string) {
    return sprintApi.getSprintById(id);
  }

  async createSprint(data: CreateSprintDTO) {
    return sprintApi.createSprint(data);
  }

  async updateSprint(id: string, data: UpdateSprintDTO) {
    return sprintApi.updateSprint(id, data);
  }

  async deleteSprint(id: string) {
    await sprintApi.deleteSprint(id);
  }
}
