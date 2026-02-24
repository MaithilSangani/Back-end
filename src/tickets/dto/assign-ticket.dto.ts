import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
    @ApiProperty({ example: 2, description: 'User ID to assign the ticket to (must be MANAGER or SUPPORT)' })
    @IsNotEmpty()
    @IsInt()
    assigned_to: number;
}
