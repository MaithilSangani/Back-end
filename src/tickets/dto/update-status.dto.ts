import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../entities/ticket.entity.js';

export class UpdateStatusDto {
    @ApiProperty({
        example: 'IN_PROGRESS',
        enum: TicketStatus,
        description: 'New status (must follow valid transitions: OPEN → IN_PROGRESS → RESOLVED → CLOSED)',
    })
    @IsNotEmpty()
    @IsEnum(TicketStatus)
    status: TicketStatus;
}
