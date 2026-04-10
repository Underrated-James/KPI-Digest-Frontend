export { TeamPage } from "./presentation/components/team-page";

export {
  clearSelectedTeamIds,
  closeDeleteTeamModal,
  closeTeamForm,
  openCreateTeamForm,
  openDeleteTeamModal,
  openEditTeamForm,
  selectDeleteTarget,
  selectEditingTeam,
  selectIsTeamFormOpen,
  selectSelectedTeamIds,
  selectTeamUi,
  setSelectedTeamIds,
  teamUiReducer,
} from "./presentation/store/team-slice";

export { CreateTeamUseCase } from "./application/use-cases/create-teams-use-case";
export { DeleteTeamUseCase } from "./application/use-cases/delete-teams-use-case";
export { GetTeamByIdUseCase } from "./application/use-cases/get-teams-by-id-use-case";
export { GetTeamsUseCase } from "./application/use-cases/get-teams-use-case";
export { UpdateTeamUseCase } from "./application/use-cases/update-teams-use-case";

export type {
  CreateTeamDTO,
  UpdateTeamDTO,
  Team,
  TeamQueryParams,
} from "./domain/types/team-types";
