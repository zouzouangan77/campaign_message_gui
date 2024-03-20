import { Message } from './entities/message.entity';
import { DataSource } from 'typeorm';

export const messagesProviders = [
  {
    provide: 'MESSAGES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
    inject: ['DATA_SOURCE'],
  },
];
