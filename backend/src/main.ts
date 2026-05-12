import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  try {
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
  } catch (error) {
    logger.error("Erreur lors du démarrage de l'application :", error);
    process.exit(1); // arrêter proprement le process
  }
}

bootstrap();
