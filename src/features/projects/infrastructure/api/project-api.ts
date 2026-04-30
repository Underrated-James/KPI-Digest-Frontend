import { getApiClient, API_ENDPOINTS } from "@/core/api";
import {
  BackendResponse,
  CreateProjectDTO,
  PaginatedData,
  UpdateProjectDTO,
  Project,
  ProjectMember,
  ProjectQueryParams,
} from "../../domain/types/project-types";

export const projectApi = {
  async getProjects(
    params?: ProjectQueryParams,
  ): Promise<PaginatedData<Project>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<Project>>>(
      API_ENDPOINTS.PROJECTS.LIST,
      { params },
    );

    return data.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<Project>>(
      API_ENDPOINTS.PROJECTS.GET(id),
    );

    return data.data;
  },

  async getProjectMembers(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members`,
    );

    return data.data;
  },

  async getProjectDevelopers(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members/developers`,
    );

    return data.data;
  },

  async getProjectQa(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members/qa`,
    );

    return data.data;
  },

  async createProject(projectData: CreateProjectDTO): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<Project>>(
      API_ENDPOINTS.PROJECTS.CREATE,
      projectData,
    );

    return data.data;
  },

  async updateProject(
    id: string,
    projectData: UpdateProjectDTO,
  ): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<Project>>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      projectData,
    );

    return data.data;
  },

  async deleteProject(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
  },
};
