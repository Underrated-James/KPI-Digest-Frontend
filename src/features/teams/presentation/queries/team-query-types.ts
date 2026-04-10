import { Team } from "../../domain/types/team-types";

export interface TeamsListData {
  content: Team[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}
