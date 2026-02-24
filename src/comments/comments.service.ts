import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from '../entities/ticket-comment.entity.js';
import { Ticket } from '../entities/ticket.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(TicketComment)
        private commentsRepository: Repository<TicketComment>,
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
    ) { }

    /**
     * Check if a user can access comments on a ticket.
     * MANAGER: always
     * SUPPORT: only if assigned to the ticket
     * USER: only if owner of the ticket
     */
    private async checkTicketAccess(
        ticketId: number,
        user: { id: number; role: string },
    ): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new NotFoundException(`Ticket #${ticketId} not found`);
        }

        if (user.role === 'MANAGER') {
            return ticket;
        }
        if (user.role === 'SUPPORT' && ticket.assigned_to === user.id) {
            return ticket;
        }
        if (user.role === 'USER' && ticket.created_by === user.id) {
            return ticket;
        }

        throw new ForbiddenException('You do not have access to this ticket');
    }

    async create(
        ticketId: number,
        createCommentDto: CreateCommentDto,
        user: { id: number; role: string },
    ): Promise<TicketComment> {
        await this.checkTicketAccess(ticketId, user);

        const comment = this.commentsRepository.create({
            ticket_id: ticketId,
            user_id: user.id,
            comment: createCommentDto.comment,
        });
        const saved = await this.commentsRepository.save(comment);
        return this.commentsRepository.findOne({ where: { id: saved.id } }) as Promise<TicketComment>;
    }

    async findAllByTicket(
        ticketId: number,
        user: { id: number; role: string },
    ): Promise<TicketComment[]> {
        await this.checkTicketAccess(ticketId, user);
        return this.commentsRepository.find({
            where: { ticket_id: ticketId },
            order: { created_at: 'ASC' },
        });
    }

    async update(
        commentId: number,
        updateCommentDto: UpdateCommentDto,
        user: { id: number; role: string },
    ): Promise<TicketComment> {
        const comment = await this.commentsRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new NotFoundException(`Comment #${commentId} not found`);
        }

        // Only MANAGER or comment author can edit
        if (user.role !== 'MANAGER' && comment.user_id !== user.id) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        comment.comment = updateCommentDto.comment;
        await this.commentsRepository.save(comment);
        return this.commentsRepository.findOne({ where: { id: commentId } }) as Promise<TicketComment>;
    }

    async remove(
        commentId: number,
        user: { id: number; role: string },
    ): Promise<void> {
        const comment = await this.commentsRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new NotFoundException(`Comment #${commentId} not found`);
        }

        // Only MANAGER or comment author can delete
        if (user.role !== 'MANAGER' && comment.user_id !== user.id) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentsRepository.remove(comment);
    }
}
