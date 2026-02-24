import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity.js';
import { User } from './user.entity.js';

@Entity('ticket_comments')
export class TicketComment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ name: 'ticket_id' })
    ticket_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    user_id: number;

    @Column({ type: 'text' })
    comment: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
