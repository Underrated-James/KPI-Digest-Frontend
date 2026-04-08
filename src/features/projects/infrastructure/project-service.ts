import { CreateProjectUseCase } from "../application/use-cases/create-project-use-case";
import { DeleteProjectUseCase } from "../application/use-cases/delete-project-use-case";
import { GetProjectByIdUseCase } from "../application/use-cases/get-project-by-id-use-case";
import { GetProjectsUseCase } from "../application/use-cases/get-projects-use-case";
import { UpdateProjectUseCase } from "../application/use-cases/update-project-use-case";
import { ProjectRepositoryImpl } from "./impl/project-impl";

const projectRepository = new ProjectRepositoryImpl();

export const projectService = {
  getProjects: new GetProjectsUseCase(projectRepository),
  getProjectById: new GetProjectByIdUseCase(projectRepository),
  createProject: new CreateProjectUseCase(projectRepository),
  updateProject: new UpdateProjectUseCase(projectRepository),
  deleteProject: new DeleteProjectUseCase(projectRepository),
};
