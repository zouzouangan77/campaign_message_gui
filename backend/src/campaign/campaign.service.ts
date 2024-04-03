import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Campaign } from '../campaign/entities/campaign.entity';
import { CampaignSending } from '../campaign/entities/campaign_sending.entity';
import { CampaignReject } from '../campaign/entities/campaign_reject.entity';
import {
  CreateCampaignDto,
  CreateCampaignSendingDto,
  CreateCampaignRejectDto,
} from '../campaign/dto/create-campaign.dto';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { UpdateCampaignDto } from '../campaign/dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @Inject('CAMPAIGNS_REPOSITORY')
    private readonly campaignRepository: Repository<Campaign>,
    @Inject('CAMPAIGN_SENDINGS_REPOSITORY')
    private readonly campaignSendingRepository: Repository<CampaignSending>,
    @Inject('CAMPAIGN_REJECTS_REPOSITORY')
    private readonly campaignRejectRepository: Repository<CampaignReject>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignRepository.save(createCampaignDto);
  }

  async createSendings(
    createCampaignSendingDtos: CreateCampaignSendingDto[],
  ): Promise<CampaignSending[]> {
    return this.campaignSendingRepository.save(createCampaignSendingDtos);
  }

  async createRejects(
    createCampaignRejectDtos: CreateCampaignRejectDto[],
  ): Promise<CampaignReject[]> {
    return this.campaignRejectRepository.save(createCampaignRejectDtos);
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<Campaign>> {
    return paginate(query, this.campaignRepository, {
      sortableColumns: [
        'id',
        'name',
        'createDate',
        'updateDate',
        'statut',
        'canal',
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name', 'statut', 'canal'],
      select: ['id', 'name', 'createDate', 'updateDate', 'statut', 'canal'],
      filterableColumns: {
        name: [FilterOperator.ILIKE, FilterSuffix.NOT],
        statut: [FilterOperator.ILIKE, FilterSuffix.NOT],
        canal: [FilterOperator.ILIKE, FilterSuffix.NOT],
      },
    });
  }

  async findOne(id: number): Promise<Campaign> {
    return this.campaignRepository.findOne({
      where: { id: id },
      relations: ['attachments', 'groups', 'message'],
    });
  }

  async findAllSendingByCampaign(id: number): Promise<CampaignSending[]> {
    return this.campaignSendingRepository
      .createQueryBuilder('campaign_sending')
      .innerJoinAndSelect('campaign_sending.contact', 'contact')
      .innerJoinAndSelect('campaign_sending.campaign', 'campaign')
      .where('campaign.id = :campaignId', { campaignId: id })
      .getMany();
  }

  async findAllRejectByCampaign(id: number): Promise<CampaignReject[]> {
    return this.campaignRejectRepository
      .createQueryBuilder('campaign_reject')
      .innerJoinAndSelect('campaign_reject.contact', 'contact')
      .innerJoinAndSelect('campaign_reject.campaign', 'campaign')
      .where('campaign.id = :campaignId', { campaignId: id })
      .getMany();
  }

  async findPageSendingByCampaign(
    query: PaginateQuery,
  ): Promise<Paginated<CampaignSending>> {
    return paginate(query, this.campaignSendingRepository, {
      relations: ['contact', 'campaign'],
      sortableColumns: [
        'id',
        'sendingDate',
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      select: [
        'id',
        'sendingDate',
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      filterableColumns: {
        'campaign.id': [FilterOperator.EQ, FilterSuffix.NOT],
      },
    });
  }

  async findPageRejectByCampaign(
    query: PaginateQuery,
  ): Promise<Paginated<CampaignReject>> {
    return paginate(query, this.campaignRejectRepository, {
      relations: ['contact', 'campaign'],
      sortableColumns: [
        'id',
        'rejectDate',
        'cause',
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [
        'cause',
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      select: [
        'id',
        'rejectDate',
        'cause',
        'contact.firstName',
        'contact.lastName',
        'contact.phoneNumber',
        'contact.idInsta',
      ],
      filterableColumns: {
        'campaign.id': [FilterOperator.EQ, FilterSuffix.NOT],
      },
    });
  }

  async update(id: number, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.findOne(id);
    return this.campaignRepository.save({
      ...campaign,
      ...updateCampaignDto,
      updateDate: new Date(),
    });
  }

  async remove(id: number): Promise<Campaign> {
    return this.campaignRepository.remove({ id: id } as Campaign);
  }

  async removeManyReject(
    campaignRejects: Array<CampaignReject>,
  ): Promise<Array<CampaignReject>> {
    return this.campaignRejectRepository.remove(campaignRejects);
  }
}
