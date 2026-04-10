import { TeamRepository } from "../../domain/repositories/team-repositories";
import { CreateTeamDTO } from "../../domain/types/team-types";

export class CreateTeamUseCase {
  constructor(private repo: TeamRepository) {}

  execute(data: CreateTeamDTO) {
    return this.repo.createTeam(data);
  }
}
