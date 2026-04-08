import { ProjectRepository } from "../../domain/repositories/project-repositories";
import { ProjectQueryParams } from "../../domain/types/project-types";

export class GetProjectsUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(params?: ProjectQueryParams) {
    return this.repo.getProjects(params);
  }
}
