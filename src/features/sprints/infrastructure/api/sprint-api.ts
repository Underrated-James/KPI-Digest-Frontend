import api from "./axios-instance";
import {
  BackendResponse,
  CreateSprintDTO,
  PaginatedData,
  UpdateSprintDTO,
  Sprint,
  SprintQueryParams,
} from "../../domain/types/sprint-types";

export const sprintApi = {
  async getSprints(params?: SprintQueryParams): Promise<PaginatedData<Sprint>> {
    const { data } = await api.get<BackendResponse<PaginatedData<Sprint>>>(
      "/sprints",
      { params }
    );

    return data.data;
  },

  async getSprintById(id: string): Promise<Sprint> {
    const { data } = await api.get<BackendResponse<Sprint>>(`/sprints/${id}`);

    return data.data;
  },

  async createSprint(sprintData: CreateSprintDTO): Promise<Sprint> {
    const { data } = await api.post<BackendResponse<Sprint>>("/sprints", sprintData);

    return data.data;
  },

  async updateSprint(id: string, sprintData: UpdateSprintDTO): Promise<Sprint> {
    const { data } = await api.patch<BackendResponse<Sprint>>(
      `/sprints/${id}`,
      sprintData
    );

    return data.data;
  },

  async deleteSprint(id: string): Promise<void> {
    await api.delete(`/sprints/${id}`);
  },
};
