import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GroupModule } from './group/group.module';
import { MessageModule } from './message/message.module';
import { CampaignModule } from './campaign/campaign.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    ContactModule,
    GroupModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
    }),
    MessageModule,
    CampaignModule,
    AttachmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
