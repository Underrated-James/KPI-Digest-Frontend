import { ProjectRepository } from "../../domain/repositories/project-repositories";
import { CreateProjectDTO } from "../../domain/types/project-types";

export class CreateProjectUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(data: CreateProjectDTO) {
    return this.repo.createProject(data);
  }
}
