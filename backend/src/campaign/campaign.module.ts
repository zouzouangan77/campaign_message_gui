import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { DatabaseModule } from 'src/database/database.module';
import { campaignsProviders } from './campaign.provider';
import { CampaignGateway } from './campaign.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [CampaignController],
  providers: [CampaignService, ...campaignsProviders, CampaignGateway],
})
export class CampaignModule {}
