import { TicketRepository } from "../../domain/repositories/ticket-repositories";

export class GetTicketByIdUseCase {
  constructor(private readonly repository: TicketRepository) {}

  async execute(id: string) {
    return this.repository.getTicketById(id);
  }
}
