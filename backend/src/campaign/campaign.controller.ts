import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  CreateCampaignDto,
  CreateCampaignSendingDto,
  CreateCampaignRejectDto,
} from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Campaign } from '../campaign/entities/campaign.entity';
import { CampaignSending } from '../campaign/entities/campaign_sending.entity';
import { CampaignReject } from '../campaign/entities/campaign_reject.entity';

@Controller('api')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('campaign')
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Post('campaign_sending')
  createSendings(
    @Body() createCampaignSendingDtos: CreateCampaignSendingDto[],
  ) {
    return this.campaignService.createSendings(createCampaignSendingDtos);
  }

  @Post('campaign_reject')
  createRejects(@Body() createCampaignRejectDtos: CreateCampaignRejectDto[]) {
    return this.campaignService.createRejects(createCampaignRejectDtos);
  }

  @Get('campaign')
  findAll() {
    return this.campaignService.findAll();
  }

  @Get('campaign/page')
  public findAllPage(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Campaign>> {
    return this.campaignService.findAllPage(query);
  }

  @Get('campaign/:id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(+id);
  }

  @Patch('campaign/:id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(+id, updateCampaignDto);
  }

  @Delete('campaign/:id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(+id);
  }

  @Get('campaign_sending/page')
  public findPageSendingByCampaign(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<CampaignSending>> {
    return this.campaignService.findPageSendingByCampaign(query);
  }

  @Get('campaign_reject/page')
  public findPageRejectByCampaign(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<CampaignReject>> {
    return this.campaignService.findPageRejectByCampaign(query);
  }

  @Get('campaign_sending/:id')
  findAllSendingByCampaign(@Param('id') id: string) {
    return this.campaignService.findAllSendingByCampaign(+id);
  }

  @Get('campaign_reject/:id')
  findAllRejectByCampaign(@Param('id') id: string) {
    return this.campaignService.findAllRejectByCampaign(+id);
  }
}
