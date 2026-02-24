import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ example: 'I am looking into this issue now.' })
    @IsNotEmpty()
    @IsString()
    comment: string;
}
