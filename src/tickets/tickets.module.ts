import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';
import { Ticket } from '../entities/ticket.entity.js';
import { TicketStatusLog } from '../entities/ticket-status-log.entity.js';
import { User } from '../entities/user.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket, TicketStatusLog, User])],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketsModule { }
