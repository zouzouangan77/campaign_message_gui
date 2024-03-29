import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Contact } from '../contact/entities/contact.entity';
import { CampaignService } from '../campaign/campaign.service';
import { ContactService } from '../contact/contact.service';
import { SocketService } from './socket.service';
import { chromium, firefox } from 'playwright';
import { useVariable } from '../shared/channel.config';
import { WhatsappChannelService } from './channel/whatsapp.channel.service';
import { InstagramChannelService } from './channel/instagram.channel.service';

const { whatsappUrl, instagramUrl, balise_replace } = useVariable();

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
    private readonly whatsappChannelService: WhatsappChannelService,
    private readonly instagramChannelService: InstagramChannelService,
  ) {}

  public async sendCampaignMessage(campaignId: number): Promise<void> {
    const campaign = await this.campaignService.findOne(campaignId);
    //campaign.statut = this.statut.PROCESSING;
    campaign.statut = this.statut.NOT_SENT;
    await this.campaignService.create(campaign);
    console.log('campaign = ', campaign);
    this.socketService.emitClientEvent(
      'updateListCampaign',
      'mise à jour de la liste des campagne dans le front car le statut de la campagne a changé',
    );
    // console.log('campaign = ', campaign);
    if (!campaign) return;
    for (const group of campaign.groups) {
      const contactsGroup = await this.contactService.findAllByGroup(group.id);
      for (const contact of contactsGroup) {
        this.mapContacts.set(contact.id, contact);
      }
    }

    //console.log('liste de personnes à contacter = ', this.mapContacts);
    await this.initBrowserPage(campaign.canal);

    // Demande d'authentification à la page à l'utilisateur
    this.socketService.emitClientEvent(
      'connectionPage',
      'Veuillez vous connecter à la page',
    );

    //Attente de retour de confirmation du client
    this.socketService.listenEvent('connectionPageOK', (data) => {
      console.log('traitement lancé');
      for (const [key, contact] of this.mapContacts) {
        const messageTransformed = campaign.message.content.replace(
          new RegExp(balise_replace.FIRSTNAME, 'g'),
          contact.firstName,
        );
        const [attachment] = campaign.attachments;
        const location = attachment ? attachment.location : undefined;
        this.whatsappChannelService.sendMessage(
          this.page,
          contact,
          messageTransformed,
          location,
        );
      }
    });

    //On met un temps d'attente dans le quel si l'utilisateur ne repond pas on arrete d'attendre
    setTimeout(
      () => this.socketService.stoplistenEvent('connectionPageOK'),
      30000,
    );
  }

  private async initBrowserPage(channelParam: string) {
    console.log('initBrowserPage');
    // this.browser = await this.BROWSER_SELECT.launch({ headless: false });
    //this.browser = await firefox.launch({ headless: false });
    this.browser = await chromium.launch({ headless: false });
    console.log('this.browser ', this.browser);
    console.log('lancement du navigateur');
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
    console.log('url = ', url);
    await this.page.goto(url);
  }
}
