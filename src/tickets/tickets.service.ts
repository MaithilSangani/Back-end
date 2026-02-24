import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity.js';
import { TicketStatusLog } from '../entities/ticket-status-log.entity.js';
import { User } from '../entities/user.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { AssignTicketDto } from './dto/assign-ticket.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

// Valid status transitions: each status can only move to the next one
const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus | null> = {
    [TicketStatus.OPEN]: TicketStatus.IN_PROGRESS,
    [TicketStatus.IN_PROGRESS]: TicketStatus.RESOLVED,
    [TicketStatus.RESOLVED]: TicketStatus.CLOSED,
    [TicketStatus.CLOSED]: null,
};

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
        @InjectRepository(TicketStatusLog)
        private statusLogsRepository: Repository<TicketStatusLog>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(
        createTicketDto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const ticket = this.ticketsRepository.create({
            ...createTicketDto,
            created_by: userId,
        });
        const saved = await this.ticketsRepository.save(ticket);
        return this.ticketsRepository.findOne({ where: { id: saved.id } }) as Promise<Ticket>;
    }

    async findAll(user: { id: number; role: string }): Promise<Ticket[]> {
        if (user.role === 'MANAGER') {
            return this.ticketsRepository.find({
                order: { created_at: 'DESC' },
            });
        }
        if (user.role === 'SUPPORT') {
            return this.ticketsRepository.find({
                where: { assigned_to: user.id },
                order: { created_at: 'DESC' },
            });
        }
        // USER — own tickets only
        return this.ticketsRepository.find({
            where: { created_by: user.id },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({ where: { id } });
        if (!ticket) {
            throw new NotFoundException(`Ticket #${id} not found`);
        }
        return ticket;
    }

    async assign(
        id: number,
        assignTicketDto: AssignTicketDto,
    ): Promise<Ticket> {
        const ticket = await this.findOne(id);

        // Check that the assignee exists and is not a USER
        const assignee = await this.usersRepository.findOne({
            where: { id: assignTicketDto.assigned_to },
        });
        if (!assignee) {
            throw new NotFoundException(
                `User #${assignTicketDto.assigned_to} not found`,
            );
        }
        if (assignee.role.name === 'USER') {
            throw new BadRequestException(
                'Tickets cannot be assigned to users with role USER',
            );
        }

        ticket.assigned_to = assignTicketDto.assigned_to;
        await this.ticketsRepository.save(ticket);
        return this.ticketsRepository.findOne({ where: { id } }) as Promise<Ticket>;
    }

    async updateStatus(
        id: number,
        updateStatusDto: UpdateStatusDto,
        userId: number,
    ): Promise<Ticket> {
        const ticket = await this.findOne(id);
        const oldStatus = ticket.status;
        const newStatus = updateStatusDto.status;

        // Validate transition
        if (VALID_TRANSITIONS[oldStatus] !== newStatus) {
            throw new BadRequestException(
                `Invalid status transition: ${oldStatus} → ${newStatus}. Allowed: ${oldStatus} → ${VALID_TRANSITIONS[oldStatus] ?? 'none (terminal state)'}`,
            );
        }

        // Log the transition
        const log = this.statusLogsRepository.create({
            ticket_id: id,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: userId,
        });
        await this.statusLogsRepository.save(log);

        // Update ticket
        ticket.status = newStatus;
        await this.ticketsRepository.save(ticket);
        return this.ticketsRepository.findOne({ where: { id } }) as Promise<Ticket>;
    }

    async remove(id: number): Promise<void> {
        const ticket = await this.findOne(id);
        await this.ticketsRepository.remove(ticket);
    }
}
