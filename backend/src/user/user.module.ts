import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { usersProviders } from './user.provider';
import { CsvService } from 'src/csv/csv.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, CsvService, ...usersProviders],
})
export class UserModule {}
