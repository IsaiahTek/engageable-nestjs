import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNotEmpty, IsNumber, IsString, Max, Min, min } from "class-validator";
import { Type } from "class-transformer";
import { Double } from "typeorm";
import { IsHalfStep } from "../decorators/is-half-step.decorator";

export class ReviewDto {
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
    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Rating must be a number' })
    @Min(0, { message: 'Rating cannot be less than 0' })
    @Max(5, { message: 'Rating cannot exceed 5' })
    @IsHalfStep({ message: 'Rating must be in increments of 0.5' })
    rating: number;
}