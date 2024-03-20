import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { DatabaseModule } from 'src/database/database.module';
import { attachmentsProviders } from './attachment.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [AttachmentController],
  providers: [AttachmentService, ...attachmentsProviders],
})
export class AttachmentModule {}
