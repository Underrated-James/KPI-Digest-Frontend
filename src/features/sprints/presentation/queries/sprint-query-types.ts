import { Sprint } from "../../domain/types/sprint-types";

export interface SprintsListData {
  content: Sprint[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}
