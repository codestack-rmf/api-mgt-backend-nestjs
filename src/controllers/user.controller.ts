import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { analyzeDeck } from 'src/dto/mtg_powerlvl_scorer';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto);
    }

    @Get("validate-deck")
    async getValidateDeck(@Query('url') url: string): Promise<any> {
        
        return analyzeDeck(url);
    }
}

