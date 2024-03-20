import { Attachment } from './entities/attachment.entity';
import { DataSource } from 'typeorm';

export const attachmentsProviders = [
  {
    provide: 'ATTACHMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Attachment),
    inject: ['DATA_SOURCE'],
  },
];
