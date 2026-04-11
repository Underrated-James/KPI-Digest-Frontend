import { CreateTeamUseCase } from "../application/use-cases/create-teams-use-case";
import { DeleteTeamUseCase } from "../application/use-cases/delete-teams-use-case";
import { GetTeamByIdUseCase } from "../application/use-cases/get-teams-by-id-use-case";
import { GetTeamsUseCase } from "../application/use-cases/get-teams-use-case";
import { UpdateTeamUseCase } from "../application/use-cases/update-teams-use-case";
import { TeamRepositoryImpl } from "./impl/team-impl";



const TeamRepository = new TeamRepositoryImpl();

export const teamService = {
  getTeams: new GetTeamsUseCase(TeamRepository),
  getTeamById: new GetTeamByIdUseCase(TeamRepository),
  createTeam: new CreateTeamUseCase(TeamRepository),
  updateTeam: new UpdateTeamUseCase(TeamRepository),
  deleteTeam: new DeleteTeamUseCase(TeamRepository),
};
