import { IsString, IsInt, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnswerDto {
    @IsInt()
    theList: number;

    @IsInt()
    manabase: number;

    @IsInt()
    strategy: number;

    @IsInt()
    winCondition: number;

    @IsInt()
    speed: number;

    @IsInt()
    consistency: number;

    @IsInt()
    buildPhilosophy: number;

    @IsInt()
    playerGoal: number;

    @IsInt()
    commanderStaples: number;

    @IsInt()
    winArchetype: number;
}