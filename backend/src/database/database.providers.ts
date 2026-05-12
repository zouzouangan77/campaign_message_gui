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
        type: 'postgres',
        extra: {
          options: '-c timezone=Europe/Paris',
        },
        host: 'localhost',
        port: 25432,
        username: 'postgres',
        password: 'postgres',
        database: 'campaign_message_db',

        synchronize: true,
        logging: true,
        entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      });

      return dataSource.initialize();
    },
  },
];
