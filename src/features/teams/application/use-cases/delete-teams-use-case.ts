import { TeamRepository } from "../../domain/repositories/team-repositories";


export class DeleteTeamUseCase {
  constructor(private repo: TeamRepository) {}

  execute(id: string) {
    return this.repo.deleteTeam(id);
  }
}
