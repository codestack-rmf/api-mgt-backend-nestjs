import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Deck } from '../entities/deck.entity';
import { Answer } from '../entities/answer.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
        @InjectRepository(Deck)
        private readonly deckRepository: Repository<Deck>,
        
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { name, deck, answers, overallScore, playerExperience } = createUserDto;

        // Crear usuario
        const user = new User();
        user.playerName = name;
        user.playerExperience = playerExperience;
        user.overallScore = parseFloat(overallScore);

        // Crear deck y asociarlo al usuario
        const newDeck = new Deck();
        newDeck.commander = deck.commander;
        newDeck.partnerCommander = deck.partnerCommander;
        newDeck.deckUrl = deck.deckUrl;
        newDeck.deckImport = deck.deckImport;
        newDeck.deckName = deck.deckName;
        newDeck.user = user;

        // Crear respuestas y asociarlas al usuario
        const answer = new Answer();
        Object.assign(answer, answers); // Copia los valores de answers al objeto Answer
        answer.user = user;

        // Guardar en la base de datos
        await this.userRepository.save(user);
        await this.deckRepository.save(newDeck);
        await this.answerRepository.save(answer);

        return user;
    }
}