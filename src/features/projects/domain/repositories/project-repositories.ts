import {
  CreateProjectDTO,
  PaginatedData,
  UpdateProjectDTO,
  Project,
  ProjectQueryParams,
} from "../types/project-types";

export interface ProjectRepository {
  getProjects(params?: ProjectQueryParams): Promise<PaginatedData<Project>>;
  getProjectById(id: string): Promise<Project>;
  createProject(data: CreateProjectDTO): Promise<Project>;
  updateProject(id: string, data: UpdateProjectDTO): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}
