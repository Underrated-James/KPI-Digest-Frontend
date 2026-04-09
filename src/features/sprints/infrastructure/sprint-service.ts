import { GetSprintByIdUseCase } from "../application/use-cases/get-sprint-by-id-use-case";
import { GetSprintsUseCase } from "../application/use-cases/get-sprints-use-case";
import { UpdateSprintUseCase } from "../application/use-cases/update-sprint-use-case";
import { SprintRepositoryImpl } from "./impl/sprint-impl";
import { CreateSprintUseCase } from "../application/use-cases/create-sprint-use-case";
import { DeleteSprintUseCase } from "../application/use-cases/delete-sprint-use-case";


const SprintRepository = new SprintRepositoryImpl();

export const sprintService = {
  getSprints: new GetSprintsUseCase(SprintRepository),
  getSprintById: new GetSprintByIdUseCase(SprintRepository),
  createSprint: new CreateSprintUseCase(SprintRepository),
  updateSprint: new UpdateSprintUseCase(SprintRepository),
  deleteSprint: new DeleteSprintUseCase(SprintRepository),
};
