import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import { CreateTicketDTO } from "../../domain/types/ticket-types";

export class CreateTicketUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(data: CreateTicketDTO[]) {
    return this.repository.createTicket(data);
  }
}
