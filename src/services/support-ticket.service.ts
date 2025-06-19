import { Repository } from "typeorm";
import { SupportTicket, TicketStatus } from "../entities/support-ticket.entity";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";
import { CreateSupportTicketDto } from "../dtos/support_ticket/create-support-ticket.dto";

export class SupportTicketService {
  private ticketRepository: Repository<SupportTicket>;
  private userRepository: Repository<User>;

  constructor() {
    this.ticketRepository = AppDataSource.getRepository(SupportTicket);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      relations: ["user"],
    });
  }

  async findById(ticketId: string): Promise<SupportTicket | null> {
    return this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ["user"],
    });
  }

  async findByUserId(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async create(dto: CreateSupportTicketDto): Promise<SupportTicket> {
    const { userId, subject, message } = dto;
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    const ticket = this.ticketRepository.create({
      subject,
      message,
      user,
      status: TicketStatus.OPEN,
    });

    return this.ticketRepository.save(ticket);
  }

  async updateStatus(
    ticketId: string,
    status: TicketStatus
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOneByOrFail({
      id: ticketId,
    });
    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }

  async delete(ticketId: string): Promise<void> {
    const ticket = await this.ticketRepository.findOneByOrFail({
      id: ticketId,
    });
    await this.ticketRepository.remove(ticket);
  }
}
