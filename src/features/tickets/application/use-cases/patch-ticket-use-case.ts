import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import { UpdateTicketDTO } from "../../domain/types/ticket-types";

export class PatchTicketUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string, data: UpdateTicketDTO) {
    return this.repository.updateTicket(id, data);
  }
}
