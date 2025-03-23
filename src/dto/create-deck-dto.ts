import { IsString, IsInt, IsObject, ValidateNested, isBoolean, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeckDto {
    @IsString()
    deckName: string;

    @IsString()
    commander: string;

    @IsString()
    partnerCommander: string;

    @IsInt()
    playerExperience: number;

    @IsString()
    deckUrl: string;

    @IsBoolean()
    deckImport: boolean;
}