import { getApiClient, API_ENDPOINTS } from "@/core/api";
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
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<Sprint>>>(
      API_ENDPOINTS.SPRINTS.LIST,
      { params },
    );

    return data.data;
  },

  async getSprintById(id: string): Promise<Sprint> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<Sprint>>(
      API_ENDPOINTS.SPRINTS.GET(id),
    );

    return data.data;
  },

  async createSprint(sprintData: CreateSprintDTO): Promise<Sprint> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<Sprint>>(
      API_ENDPOINTS.SPRINTS.CREATE,
      sprintData,
    );

    return data.data;
  },

  async updateSprint(id: string, sprintData: UpdateSprintDTO): Promise<Sprint> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<Sprint>>(
      API_ENDPOINTS.SPRINTS.UPDATE(id),
      sprintData,
    );

    return data.data;
  },

  async deleteSprint(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.SPRINTS.DELETE(id));
  },
};
