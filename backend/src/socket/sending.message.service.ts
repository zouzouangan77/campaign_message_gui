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
import { useFunction } from '../shared/function.util';
import { ChannelService } from './channel/channel.service';
import {
  CreateCampaignSendingDto,
  CreateCampaignRejectDto,
} from '../campaign/dto/create-campaign.dto';
import { CampaignReject } from '../campaign/entities/campaign_reject.entity';

const { whatsappUrl, instagramUrl, balise_replace, myTime } = useVariable();
const { sleep } = useFunction();

@Injectable()
export class SendingMessageService {
  private mapContacts: Map<number, Contact> = new Map();
  private channelService: ChannelService;
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
    if (!campaign) return;

    if (
      campaign.statut == this.statut.PENDING ||
      campaign.statut == this.statut.PROCESSING
    ) {
      console.log('campagne encours de traitement');
      return;
    }

    campaign.statut = this.statut.PENDING;
    //campaign.statut = this.statut.NOT_SENT;
    await this.campaignService.create(campaign);
    this.socketService.emitClientEvent('updateListCampaign', 'OK');

    for (const group of campaign.groups) {
      const contactsGroup = await this.contactService.findAllByGroup(group.id);
      for (const contact of contactsGroup) {
        this.mapContacts.set(contact.id, contact);
      }
    }

    try {
      await this.initBrowserPage(campaign.canal);
    } catch (err) {
      campaign.statut = this.statut.NOT_SENT;
      await this.campaignService.create(campaign);
      this.socketService.emitClientEvent('errorSendCampaignMessage', 'OK');
    }

    // Demande d'authentification à la page à l'utilisateur
    this.socketService.emitClientEvent('connectionPage', campaign);
    let responseOK = false;
    let stopProcessing = false;

    //Attente de retour de confirmation du client
    this.socketService.listenEvent('connectionPageOK_SendingMessage', async (campaignId) => {
      responseOK = true;
      const campaignSendings = new Array<CreateCampaignSendingDto>();
      const campaignRejects = new Array<CreateCampaignRejectDto>();
      if (campaign.id === campaignId) {
        console.log('connectionPageOK_SendingMessage traitement lancé');
        campaign.statut = this.statut.PROCESSING;
        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');
        await sleep(myTime.TIME_APP_LOADING);

        const actionBeforeSendAllMessageResponse =
          await this.channelService.actionBeforeSendAllMessage(this.page);

        if (actionBeforeSendAllMessageResponse.statut) {
          for (const [key, contact] of this.mapContacts) {
            if (stopProcessing) {
              campaignRejects.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
                cause: 'Arret de la campagne',
              } as CreateCampaignRejectDto);
              continue;
            }
            // console.log('contact = ', contact);
            await sleep(myTime.TIME_WAIT_ACTION);
            const messageTransformed = campaign.message.content.replace(
              new RegExp(balise_replace.FIRSTNAME, 'g'),
              contact.firstName,
            );
            const [attachment] = campaign.attachments;
            const location = attachment ? attachment.location : undefined;

            const sendMessageResponse = await this.channelService.sendMessage(
              this.page,
              contact,
              messageTransformed,
              location,
            );
            if (sendMessageResponse.statut) {
              campaignSendings.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
              } as CreateCampaignSendingDto);
            } else {
              campaignRejects.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
                cause: sendMessageResponse.error_message,
              } as CreateCampaignRejectDto);
            }
          }
        }

        //Tous les contacts on été traité, on sauvegarde maintenant les information d'envoi et de rejet
        if (campaignSendings.length > 0) {
          await this.campaignService.createSendings(campaignSendings);
        }
        if (campaignRejects.length > 0) {
          await this.campaignService.createRejects(campaignRejects);
        }
        if (actionBeforeSendAllMessageResponse.statut) {
          campaign.statut = this.statut.SENT;
        } else {
          campaign.statut = this.statut.NOT_SENT;
        }

        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');

        await this.closeBrowserPage();
      }
    });

    this.socketService.listenEvent(
      'cancelSendCampaignMessage',
      async (campaignId) => {
        if (campaign.id === campaignId) {
          console.log("annulation de l'envoi ", campaignId);
          campaign.statut = this.statut.NOT_SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          await this.closeBrowserPage();
          stopProcessing = true;
        }
      },
    );

    //On met un temps d'attente dans le quel si l'utilisateur ne repond pas on arrete d'attendre
    setTimeout(async () => {
      if (!responseOK) {
        this.socketService.stoplistenEvent('connectionPageOK_SendingMessage', async () => {
          campaign.statut = this.statut.NOT_SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          this.socketService.emitClientEvent('cancelSendCampaignMessage', 'OK');
        });
      }
    }, myTime.TIME_WAIT_CONNECTION);
  }

  public async sendCampaignRejectMessage(campaignId: number): Promise<void> {
    console.log('sendCampaignRejectMessage')
    const campaign = await this.campaignService.findOne(campaignId);
    if (!campaign) return;

    if (
      campaign.statut == this.statut.PENDING ||
      campaign.statut == this.statut.PROCESSING
    ) {
      console.log('campagne encours de traitement');
      return;
    }

    campaign.statut = this.statut.PENDING;
    //campaign.statut = this.statut.NOT_SENT;
    await this.campaignService.create(campaign);
    this.socketService.emitClientEvent('updateListCampaign', 'OK');

    const
        lastCampaignRejects =
      await this.campaignService.findAllRejectByCampaign(campaign.id);
    try {
      await this.initBrowserPage(campaign.canal);
    } catch (err) {
      campaign.statut = this.statut.SENT;
      await this.campaignService.create(campaign);
      this.socketService.emitClientEvent('errorSendCampaignMessage', 'OK');
    }

    // Demande d'authentification à la page à l'utilisateur
    this.socketService.emitClientEvent('connectionPage', campaign);
    let responseOK = false;
    let stopProcessing = false;

    //Attente de retour de confirmation du client
    this.socketService.listenEvent('connectionPageOK_SendingRejectMessage', async (campaignId) => {
      responseOK = true;
      const campaignSendings = new Array<CreateCampaignSendingDto>();
      const removeCampaignRejects = new Array<CampaignReject>();
      if (campaign.id === campaignId) {
        console.log('connectionPageOK_SendingRejectMessage traitement lancé');
        campaign.statut = this.statut.PROCESSING;
        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');
        await sleep(myTime.TIME_APP_LOADING);
        const actionBeforeSendAllMessageResponse =
          await this.channelService.actionBeforeSendAllMessage(this.page);

        if (actionBeforeSendAllMessageResponse.statut) {
          for (const lastCampaignReject of lastCampaignRejects) {
            const contact = lastCampaignReject.contact;

            if (stopProcessing) {
              break;
            }

            await sleep(myTime.TIME_WAIT_ACTION);
            const messageTransformed = campaign.message.content.replace(
              new RegExp(balise_replace.FIRSTNAME, 'g'),
              contact.firstName,
            );
            const [attachment] = campaign.attachments;
            const location = attachment ? attachment.location : undefined;

            const sendMessageResponse = await this.channelService.sendMessage(
              this.page,
              contact,
              messageTransformed,
              location,
            );
            if (sendMessageResponse.statut) {
              campaignSendings.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
              } as CreateCampaignSendingDto);

              removeCampaignRejects.push(lastCampaignReject);
            }
          }
        }

        //Tous les contacts on été traité, on sauvegarde maintenant les information d'envoi et de rejet
        if (campaignSendings.length > 0) {
          await this.campaignService.createSendings(campaignSendings);
          await this.campaignService.removeManyReject(removeCampaignRejects);
        }

        campaign.statut = this.statut.SENT;
        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');

        await this.closeBrowserPage();
      }
    });

    this.socketService.listenEvent(
      'cancelSendCampaignMessage',
      async (campaignId) => {
        if (campaign.id === campaignId) {
          console.log("annulation de l'envoi ", campaignId);
          campaign.statut = this.statut.SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          await this.closeBrowserPage();
        }
      },
    );

    //On met un temps d'attente dans le quel si l'utilisateur ne repond pas on arrete d'attendre
    setTimeout(async () => {
      if (!responseOK) {
        this.socketService.stoplistenEvent('connectionPageOK_SendingRejectMessage', async () => {
          campaign.statut = this.statut.SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          this.socketService.emitClientEvent('cancelSendCampaignMessage', 'OK');
        });
      }
    }, myTime.TIME_WAIT_CONNECTION);
  }

  private async initBrowserPage(channelParam: string) {
    console.log('initBrowserPage');
    // this.browser = await this.BROWSER_SELECT.launch({ headless: false });
    // this.browser = await firefox.launch({ headless: false });
    this.browser = await chromium.launch({ headless: false });
    console.log('lancement du navigateur');
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    let url = '';
    switch (channelParam) {
      case this.channel.WHATS_APP:
        url = whatsappUrl;
        this.channelService = this.whatsappChannelService;
        break;
      case this.channel.INSTAGRAM:
        url = instagramUrl;
        this.channelService = this.instagramChannelService;
        break;
    }
    await this.page.goto(url);
  }

  private async closeBrowserPage() {
    await sleep(myTime.TIME_WAIT_END_ACTION);
    await this.context.close();
    await this.browser.close();
  }
}
