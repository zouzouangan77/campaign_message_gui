import { Group } from './entities/group.entity';
import { DataSource } from 'typeorm';

export const groupsProviders = [
  {
    provide: 'GROUPS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Group),
    inject: ['DATA_SOURCE'],
  },
];
