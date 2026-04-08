import api from "./axios-instance";
import {
  BackendResponse,
  CreateProjectDTO,
  PaginatedData,
  UpdateProjectDTO,
  Project,
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
