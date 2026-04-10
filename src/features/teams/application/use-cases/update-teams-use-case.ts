import { TeamRepository } from "../../domain/repositories/team-repositories";
import { UpdateTeamDTO } from "../../domain/types/team-types";

export class UpdateTeamUseCase {
  constructor(private repo: TeamRepository) {}

  execute(id: string, data: UpdateTeamDTO) {
    return this.repo.updateTeam(id, data);
  }
}
