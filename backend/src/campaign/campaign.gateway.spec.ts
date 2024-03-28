import { Test, TestingModule } from '@nestjs/testing';
import { CampaignGateway } from './campaign.gateway';

describe('CampaignGateway', () => {
  let gateway: CampaignGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignGateway],
    }).compile();

    gateway = module.get<CampaignGateway>(CampaignGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
