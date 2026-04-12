import { TicketRepository } from "../../domain/repositories/ticket-repositories";

export class DeleteTicketUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string) {
    await this.repository.deleteTicket(id);
  }
}
