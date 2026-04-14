import { ProjectRepository } from "../../domain/repositories/project-repositories";
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectQueryParams,
} from "../../domain/types/project-types";
import { projectApi } from "../api/project-api";

export class ProjectRepositoryImpl implements ProjectRepository {
  async getProjects(params?: ProjectQueryParams) {
    return projectApi.getProjects(params);
  }

  async getProjectById(id: string) {
    return projectApi.getProjectById(id);
  }

  async getProjectMembers(id: string) {
    return projectApi.getProjectMembers(id);
  }

  async getProjectDevelopers(id: string) {
    return projectApi.getProjectDevelopers(id);
  }

  async getProjectQa(id: string) {
    return projectApi.getProjectQa(id);
  }

  async createProject(data: CreateProjectDTO) {
    return projectApi.createProject(data);
  }

  async updateProject(id: string, data: UpdateProjectDTO) {
    return projectApi.updateProject(id, data);
  }

  async deleteProject(id: string) {
    await projectApi.deleteProject(id);
  }
}
