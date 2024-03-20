import { Campaign } from './entities/campaign.entity';
import { CampaignSending } from './entities/campaign_sending.entity';
import { CampaignReject } from './entities/campaign_reject.entity';
import { DataSource } from 'typeorm';

export const campaignsProviders = [
  {
    provide: 'CAMPAIGNS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Campaign),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CAMPAIGN_SENDINGS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CampaignSending),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CAMPAIGN_REJECTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CampaignReject),
    inject: ['DATA_SOURCE'],
  },
];
