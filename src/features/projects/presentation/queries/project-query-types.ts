import { Project } from "../../domain/types/project-types";

export interface ProjectsListData {
  content: Project[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}
