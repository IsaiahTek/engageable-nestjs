import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ReviewDto{
    @ApiProperty({
        description: 'review',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    text: string

    @ApiProperty({
        description: 'rating',
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    rating: number
}