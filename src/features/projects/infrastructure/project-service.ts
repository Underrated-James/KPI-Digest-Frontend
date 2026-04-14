import { CreateProjectUseCase } from "../application/use-cases/create-project-use-case";
import { DeleteProjectUseCase } from "../application/use-cases/delete-project-use-case";
import { GetProjectByIdUseCase } from "../application/use-cases/get-project-by-id-use-case";
import { GetProjectDevelopersUseCase } from "../application/use-cases/get-project-developers-use-case";
import { GetProjectMembersUseCase } from "../application/use-cases/get-project-members-use-case";
import { GetProjectQaUseCase } from "../application/use-cases/get-project-qa-use-case";
import { GetProjectsUseCase } from "../application/use-cases/get-projects-use-case";
import { UpdateProjectUseCase } from "../application/use-cases/update-project-use-case";
import { ProjectRepositoryImpl } from "./impl/project-impl";

const projectRepository = new ProjectRepositoryImpl();

export const projectService = {
  getProjects: new GetProjectsUseCase(projectRepository),
  getProjectById: new GetProjectByIdUseCase(projectRepository),
  getProjectMembers: new GetProjectMembersUseCase(projectRepository),
  getProjectDevelopers: new GetProjectDevelopersUseCase(projectRepository),
  getProjectQa: new GetProjectQaUseCase(projectRepository),
  createProject: new CreateProjectUseCase(projectRepository),
  updateProject: new UpdateProjectUseCase(projectRepository),
  deleteProject: new DeleteProjectUseCase(projectRepository),
};
