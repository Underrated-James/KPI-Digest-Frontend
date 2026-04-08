export { ProjectPage } from "./presentation/components/project-page";

export {
  clearSelectedProjectIds,
  closeDeleteProjectModal,
  closeProjectForm,
  openCreateProjectForm,
  openDeleteProjectModal,
  openEditProjectForm,
  selectDeleteTarget,
  selectEditingProject,
  selectIsProjectFormOpen,
  selectSelectedProjectIds,
  selectProjectUi,
  setSelectedProjectIds,
  projectUiReducer,
} from "./presentation/store/project-slice";

export { CreateProjectUseCase } from "./application/use-cases/create-project-use-case";
export { DeleteProjectUseCase } from "./application/use-cases/delete-project-use-case";
export { GetProjectByIdUseCase } from "./application/use-cases/get-project-by-id-use-case";
export { GetProjectsUseCase } from "./application/use-cases/get-projects-use-case";
export { UpdateProjectUseCase } from "./application/use-cases/update-project-use-case";

export type {
  CreateProjectDTO,
  UpdateProjectDTO,
  Project,
  ProjectStatus,
  ProjectQueryParams,
} from "./domain/types/project-types";
