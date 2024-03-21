import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { DatabaseModule } from 'src/database/database.module';
import { messagesProviders } from './message.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [MessageController],
  providers: [MessageService, ...messagesProviders],
})
export class MessageModule {}
