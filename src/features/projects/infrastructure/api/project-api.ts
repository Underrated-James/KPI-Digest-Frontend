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

type RawProjectMember = Omit<ProjectMember, "status"> & {
  id?: string;
  _id?: string;
  status: boolean | string;
};

type RawProject = Omit<Project, "members"> & {
  id?: string;
  _id?: string;
  members: RawProjectMember[];
};

function normalizeMemberStatus(status: RawProjectMember["status"]): boolean {
  if (typeof status === "string") {
    return status.toLowerCase() === "true";
  }

  return Boolean(status);
}

function normalizeProjectMember(member: RawProjectMember): ProjectMember {
  return {
    ...member,
    id: member.id ?? member._id ?? "",
    status: normalizeMemberStatus(member.status),
  };
}

function normalizeProject(project: RawProject): Project {
  return {
    ...project,
    id: project.id ?? project._id ?? "",
    members: Array.isArray(project.members)
      ? project.members.map(normalizeProjectMember)
      : [],
  };
}

export const projectApi = {
  async getProjects(
    params?: ProjectQueryParams,
  ): Promise<PaginatedData<Project>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<RawProject>>>(
      API_ENDPOINTS.PROJECTS.LIST,
      { params },
    );

    return {
      ...data.data,
      content: data.data.content.map(normalizeProject),
    };
  },

  async getProjectById(id: string): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<RawProject>>(
      API_ENDPOINTS.PROJECTS.GET(id),
    );

    return normalizeProject(data.data);
  },

  async getProjectMembers(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<RawProjectMember[]>>(
      `/projects/${id}/members`,
    );

    return data.data.map(normalizeProjectMember);
  },

  async getProjectDevelopers(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<RawProjectMember[]>>(
      `/projects/${id}/members/developers`,
    );

    return data.data.map(normalizeProjectMember);
  },

  async getProjectQa(id: string): Promise<ProjectMember[]> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<RawProjectMember[]>>(
      `/projects/${id}/members/qa`,
    );

    return data.data.map(normalizeProjectMember);
  },

  async createProject(projectData: CreateProjectDTO): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<RawProject>>(
      API_ENDPOINTS.PROJECTS.CREATE,
      projectData,
    );

    return normalizeProject(data.data);
  },

  async updateProject(
    id: string,
    projectData: UpdateProjectDTO,
  ): Promise<Project> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<RawProject>>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      projectData,
    );

    return normalizeProject(data.data);
  },

  async deleteProject(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
  },
};
