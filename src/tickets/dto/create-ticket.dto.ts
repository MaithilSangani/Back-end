import {
    IsNotEmpty,
    IsString,
    MinLength,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../../entities/ticket.entity.js';

export class CreateTicketDto {
    @ApiProperty({ example: 'Login page broken', minLength: 5 })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    title: string;

    @ApiProperty({
        example: 'The login page returns a 500 error when submitting credentials',
        minLength: 10,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    description: string;

    @ApiProperty({
        example: 'HIGH',
        enum: TicketPriority,
        required: false,
        default: 'MEDIUM',
    })
    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority;
}
