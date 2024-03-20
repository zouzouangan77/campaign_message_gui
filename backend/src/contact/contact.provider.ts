import { Contact } from './entities/contact.entity';
import { DataSource } from 'typeorm';

export const contactsProviders = [
  {
    provide: 'CONTACTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Contact),
    inject: ['DATA_SOURCE'],
  },
];
