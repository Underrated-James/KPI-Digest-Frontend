import {
  CreateProjectDTO,
  PaginatedData,
  UpdateProjectDTO,
  Project,
  ProjectMember,
  ProjectQueryParams,
} from "../types/project-types";

export interface ProjectRepository {
  getProjects(params?: ProjectQueryParams): Promise<PaginatedData<Project>>;
  getProjectById(id: string): Promise<Project>;
  getProjectMembers(id: string): Promise<ProjectMember[]>;
  getProjectDevelopers(id: string): Promise<ProjectMember[]>;
  getProjectQa(id: string): Promise<ProjectMember[]>;
  createProject(data: CreateProjectDTO): Promise<Project>;
  updateProject(id: string, data: UpdateProjectDTO): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}
