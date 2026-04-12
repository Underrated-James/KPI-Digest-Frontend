import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import { PutTicketDTO } from "../../domain/types/ticket-types";

export class UpdateTicketUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string, data: PutTicketDTO) {
    return this.repository.putTicket(id, data);
  }
}
