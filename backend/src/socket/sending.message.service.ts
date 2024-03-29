import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Message } from '../message/entities/message.entity';
import { Group } from '../group/entities/group.entity';
import { Contact } from '../contact/entities/contact.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { CampaignService } from '../campaign/campaign.service';
import { Socket } from 'socket.io';
import { ContactService } from '../contact/contact.service';
import { CreateCampaignDto } from '../campaign/dto/create-campaign.dto';
import { SocketService } from './socket.service';
import { chromium } from 'playwright';
import { useVariable } from '../shared/channel.config';

const { whatsappUrl, instagramUrl } = useVariable();

@Injectable()
export class SendingMessageService {
  private mapContacts: Map<number, Contact> = new Map();
  private statut = {
    PROCESSING: 'PROCESSING',
    PENDING: 'PENDING',
    NOT_SENT: 'NOT_SENT',
    SENT: 'SENT',
  };
  private channel = {
    WHATS_APP: 'WHATS_APP',
    INSTAGRAM: 'INSTAGRAM',
  };
  private BROWSER_SELECT = chromium;
  private browser;
  private context;
  private page;

  constructor(
    private readonly campaignService: CampaignService,
    private readonly contactService: ContactService,
    private readonly socketService: SocketService,
  ) {}

  public async sendCampaignMessage(campaignId: number): Promise<void> {
    const campaign = await this.campaignService.findOne(campaignId);
    campaign.statut = this.statut.PROCESSING;
    //campaign.statut = this.statut.NOT_SENT;
    await this.campaignService.create(campaign);
    this.socketService.emitClientEvent(
      'updateListCampaign',
      'mise à jour de la liste des campagne dans le front car le statut de la campagne a changé',
    );
    console.log('campaign = ', campaign);
    if (!campaign) return;
    for (const group of campaign.groups) {
      const contactsGroup = await this.contactService.findAllByGroup(group.id);
      for (const contact of contactsGroup) {
        this.mapContacts.set(contact.id, contact);
      }
    }

    console.log('liste de personnes à contacter = ', this.mapContacts);
  }

  private async initBrowserPage(channelParam: string) {
    this.browser = await this.BROWSER_SELECT.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    let url = 'http://google.com';
    switch (channelParam) {
      case this.channel.WHATS_APP:
        url = whatsappUrl;
        break;
      case this.channel.INSTAGRAM:
        url = instagramUrl;
        break;
    }
    await this.page.goto(url);
  }
}
