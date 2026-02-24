import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { TicketComment } from '../entities/ticket-comment.entity.js';
import { Ticket } from '../entities/ticket.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([TicketComment, Ticket])],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule { }
