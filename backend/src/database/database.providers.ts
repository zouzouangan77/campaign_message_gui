import { DataSource } from 'typeorm';

// export const databaseProviders = [
//   {
//     provide: 'SEQUELIZE',
//     useFactory: async () => {
//       const sequelize = new Sequelize({
//         dialect: 'sqlite',
//         storage: '.db/data.sqlite3',
//       });
//       sequelize.addModels([Contact]);
//       await sequelize.sync();
//       return sequelize;
//     },
//   },
// ];

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'sqlite',
        database: '.db/data.sqlite3',
        synchronize: true,
        logging: true,
        entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      });

      return dataSource.initialize();
    },
  },
];
