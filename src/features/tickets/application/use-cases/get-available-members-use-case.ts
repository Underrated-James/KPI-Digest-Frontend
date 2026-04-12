import { TicketRepository } from "../../domain/repositories/ticket-repositories";

export class GetAvailableMembersUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(ticketId: string) {
    return this.repository.getAvailableMembers(ticketId);
  }
}
