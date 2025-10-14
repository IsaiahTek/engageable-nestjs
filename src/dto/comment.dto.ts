import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    description: 'comment',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
