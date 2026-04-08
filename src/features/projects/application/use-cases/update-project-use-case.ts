import { ProjectRepository } from "../../domain/repositories/project-repositories";
import { UpdateProjectDTO } from "../../domain/types/project-types";

export class UpdateProjectUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string, data: UpdateProjectDTO) {
    return this.repo.updateProject(id, data);
  }
}
