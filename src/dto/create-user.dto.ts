import { IsString, IsInt, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeckDto } from './create-deck-dto';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateUserDto {
    @IsString()
    name: string;

    @ValidateNested()
    @Type(() => CreateDeckDto)
    deck: CreateDeckDto;

    @ValidateNested()
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto;

    @IsString()
    overallScore: string;

    @IsInt()
    playerExperience: number;
    
}