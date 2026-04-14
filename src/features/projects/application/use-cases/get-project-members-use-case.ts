import { ProjectRepository } from "../../domain/repositories/project-repositories";

export class GetProjectMembersUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string) {
    return this.repo.getProjectMembers(id);
  }
}
