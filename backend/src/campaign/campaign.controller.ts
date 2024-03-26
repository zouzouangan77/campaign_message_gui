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
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {Paginate, Paginated, PaginateQuery} from "nestjs-paginate";
import {Campaign} from "../campaign/entities/campaign.entity";

@Controller('api')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('campaign')
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
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
}
