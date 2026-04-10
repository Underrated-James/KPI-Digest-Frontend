import { TeamRepository } from "../../domain/repositories/team-repositories";
import { TeamQueryParams } from "../../domain/types/team-types";

export class GetTeamsUseCase {
  constructor(private repo: TeamRepository) {}

  execute(params?: TeamQueryParams) {
    return this.repo.getTeams(params);
  }
}
