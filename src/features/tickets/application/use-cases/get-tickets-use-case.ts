import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import { TicketQueryParams } from "../../domain/types/ticket-types";

export class GetTicketsUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(params?: TicketQueryParams) {
    return this.repository.getTickets(params);
  }
}
