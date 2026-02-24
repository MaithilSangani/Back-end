import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
    @ApiProperty({ example: 'Updated: Found the root cause of the issue.' })
    @IsNotEmpty()
    @IsString()
    comment: string;
}
