import { User } from "../../domain/types/user-types";

export interface UsersListData {
  users: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}
