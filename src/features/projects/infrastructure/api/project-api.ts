import api from "./axios-instance";
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
  async getProjects(params?: ProjectQueryParams): Promise<PaginatedData<Project>> {
    const { data } = await api.get<BackendResponse<PaginatedData<Project>>>(
      "/projects",
      { params }
    );

    return data.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const { data } = await api.get<BackendResponse<Project>>(`/projects/${id}`);

    return data.data;
  },

  async getProjectMembers(id: string): Promise<ProjectMember[]> {
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members`
    );

    return data.data;
  },

  async getProjectDevelopers(id: string): Promise<ProjectMember[]> {
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members/developers`
    );

    return data.data;
  },

  async getProjectQa(id: string): Promise<ProjectMember[]> {
    const { data } = await api.get<BackendResponse<ProjectMember[]>>(
      `/projects/${id}/members/qa`
    );

    return data.data;
  },

  async createProject(projectData: CreateProjectDTO): Promise<Project> {
    const { data } = await api.post<BackendResponse<Project>>("/projects", projectData);

    return data.data;
  },

  async updateProject(id: string, projectData: UpdateProjectDTO): Promise<Project> {
    const { data } = await api.patch<BackendResponse<Project>>(
      `/projects/${id}`,
      projectData
    );

    return data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
