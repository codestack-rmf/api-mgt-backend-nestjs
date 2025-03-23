import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger("Application");
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  /*app.use(express.json()); // Middleware para analizar JSON en el cuerpo de las solicitudes
  app.use(express.urlencoded({ extended: true }));*/


  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:8100',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4200',
    'https://app.omenpro.com',
    'https://api.omenpro.com'
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
  };

  app.enableCors(corsOptions);
  
  await app.listen(process.env.PORT ?? 3000);
  logger.debug(`Nest application successfully started in port ${process.env.PORT}`);

}
bootstrap();
