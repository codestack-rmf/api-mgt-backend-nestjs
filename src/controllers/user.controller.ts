import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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

    @Get(":id")
    async getUsers(@Param("id") idDeck): Promise<any> {
        console.log(idDeck);
        return analyzeDeck(idDeck);
    }
}

