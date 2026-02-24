import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({
        example: 'SUPPORT',
        enum: ['MANAGER', 'SUPPORT', 'USER'],
    })
    @IsNotEmpty()
    @IsIn(['MANAGER', 'SUPPORT', 'USER'])
    role: string;
}
