import { TicketRepository } from "../../domain/repositories/ticket-repositories";

export class GetSprintCapacityUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(sprintId: string) {
    return this.repository.getSprintCapacity(sprintId);
  }
}
