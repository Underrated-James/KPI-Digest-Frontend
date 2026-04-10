import { TeamRepository } from "../../domain/repositories/team-repositories";


export class GetTeamByIdUseCase   {
  constructor(private repo: TeamRepository) {}

  execute(id: string) {
    return this.repo.getTeamById(id);
  }
}
        