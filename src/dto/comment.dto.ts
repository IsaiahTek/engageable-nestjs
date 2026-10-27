import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    description: 'comment content',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID if replying to a comment',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}

