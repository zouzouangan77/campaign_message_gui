import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { DatabaseModule } from 'src/database/database.module';
import { groupsProviders } from './group.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupController],
  providers: [GroupService, ...groupsProviders],
})
export class GroupModule {}
