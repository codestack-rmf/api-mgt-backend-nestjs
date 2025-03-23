import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import stripeConfig from './config/stripe.config';
import { User } from './entities/user.entity';
import * as Joi from 'joi';
import { Answer } from './entities/answer.entity';
import { Deck } from './entities/deck.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development')
      }),
      isGlobal: true,
      load: [databaseConfig, stripeConfig]
    }),
    TypeOrmModule.forFeature([
      User,Answer,Deck
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = config.get<TypeOrmModuleOptions>('database.config');
    
        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }
    
        return dbConfig;
      }
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
