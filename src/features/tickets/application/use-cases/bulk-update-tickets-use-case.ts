import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import { UpdateTicketDTO } from "../../domain/types/ticket-types";

export class BulkUpdateTicketsUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(tickets: ({ id: string } & UpdateTicketDTO)[]) {
    return this.repository.bulkUpdateTickets(tickets);
  }
}
