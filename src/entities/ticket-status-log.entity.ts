import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity.js';
import { User } from './user.entity.js';

@Entity('ticket_status_logs')
export class TicketStatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.statusLogs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ name: 'ticket_id' })
    ticket_id: number;

    @Column({
        type: 'enum',
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        name: 'old_status',
    })
    old_status: TicketStatus;

    @Column({
        type: 'enum',
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        name: 'new_status',
    })
    new_status: TicketStatus;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'changed_by' })
    changedBy: User;

    @Column({ name: 'changed_by' })
    changed_by: number;

    @CreateDateColumn({ name: 'changed_at' })
    changed_at: Date;
}
