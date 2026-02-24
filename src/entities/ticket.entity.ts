import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity.js';
import { TicketComment } from './ticket-comment.entity.js';
import { TicketStatusLog } from './ticket-status-log.entity.js';

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @Column({ name: 'created_by' })
    created_by: number;

    @ManyToOne(() => User, { eager: true, nullable: true })
    @JoinColumn({ name: 'assigned_to' })
    assignedTo: User | null;

    @Column({ name: 'assigned_to', nullable: true })
    assigned_to: number | null;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @OneToMany(() => TicketComment, (comment) => comment.ticket)
    comments: TicketComment[];

    @OneToMany(() => TicketStatusLog, (log) => log.ticket)
    statusLogs: TicketStatusLog[];
}
