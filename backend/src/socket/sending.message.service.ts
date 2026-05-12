import {Inject, Injectable, Logger} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Contact } from '../contact/entities/contact.entity';
import { CampaignService } from '../campaign/campaign.service';
import { ContactService } from '../contact/contact.service';
import { SocketService } from './socket.service';
import { chromium, firefox } from 'playwright';
import * as path from 'path';
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
  private readonly logger = new Logger(SendingMessageService.name);
  private mapContacts: Map<number, Contact> = new Map();
  private channelService: ChannelService;
  private isStopped = false;
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
      this.logger.log('campagne encours de traitement');
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
      return;
    }

    // Demande d'authentification à la page à l'utilisateur
    this.isStopped = false;
    this.socketService.emitClientEvent('connectionPage', campaign);
    let responseOK = false;

    this.socketService.stoplistenEvent('cancelSendCampaignMessage', () => {});
    this.socketService.stoplistenEvent('connectionPageOK_SendingMessage', () => {});

    //Attente de retour de confirmation du client
    this.socketService.listenEvent('connectionPageOK_SendingMessage', async (campaignId) => {
      responseOK = true;
      const campaignSendings = new Array<CreateCampaignSendingDto>();
      const campaignRejects = new Array<CreateCampaignRejectDto>();
      if (campaign.id === campaignId) {
        this.logger.debug('connectionPageOK_SendingMessage traitement lancé');
        campaign.statut = this.statut.PROCESSING;
        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');
        await sleep(myTime.TIME_APP_LOADING);

        const actionBeforeSendAllMessageResponse =
          await this.channelService.actionBeforeSendAllMessage(this.page);

        const startTime = Date.now();
        if (actionBeforeSendAllMessageResponse.statut) {
          for (const [key, contact] of this.mapContacts) {
            if (this.isStopped) {
              campaignRejects.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
                cause: 'Arret de la campagne',
              } as CreateCampaignRejectDto);
              continue;
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
            } else {
              campaignRejects.push({
                contact: { id: contact.id },
                campaign: { id: campaign.id },
                cause: sendMessageResponse.error_message,
              } as CreateCampaignRejectDto);
            }
          }
        }
        const totalTime = Date.now() - startTime;
        this.logger.log(`Campagne traitée en ${totalTime}ms`);

        // Si la campagne a été stoppée, on ne modifie pas le statut (déjà mis à NOT_SENT)
        if (!this.isStopped) {
          if (campaignSendings.length > 0) {
            await this.campaignService.createSendings(campaignSendings);
          }
          if (campaignRejects.length > 0) {
            await this.campaignService.createRejects(campaignRejects);
          }
          campaign.statut = actionBeforeSendAllMessageResponse.statut
            ? this.statut.SENT
            : this.statut.NOT_SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          await this.closeBrowserPage();
        } else {
          // Sauvegarder quand même les envois/rejets déjà effectués avant le stop
          if (campaignSendings.length > 0) {
            await this.campaignService.createSendings(campaignSendings);
          }
          if (campaignRejects.length > 0) {
            await this.campaignService.createRejects(campaignRejects);
          }
        }
      }
    });

    this.socketService.listenEvent(
      'cancelSendCampaignMessage',
      async (campaignId) => {
        if (campaign.id === campaignId) {
          this.logger.log("annulation de l'envoi ", campaignId);
          // Flag immédiat pour stopper la boucle dès la prochaine itération
          this.isStopped = true;
          campaign.statut = this.statut.NOT_SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          await this.closeBrowserPage();
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
    this.logger.debug('sendCampaignRejectMessage')
    const campaign = await this.campaignService.findOne(campaignId);
    if (!campaign) return;

    if (
      campaign.statut == this.statut.PENDING ||
      campaign.statut == this.statut.PROCESSING
    ) {
      this.logger.debug('campagne encours de traitement');
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
      return;
    }

    // Demande d'authentification à la page à l'utilisateur
    this.isStopped = false;
    this.socketService.emitClientEvent('connectionPage', campaign);
    let responseOK = false;

    this.socketService.stoplistenEvent('cancelSendCampaignMessage', () => {});
    this.socketService.stoplistenEvent('connectionPageOK_SendingRejectMessage', () => {});

    //Attente de retour de confirmation du client
    this.socketService.listenEvent('connectionPageOK_SendingRejectMessage', async (campaignId) => {
      responseOK = true;
      const campaignSendings = new Array<CreateCampaignSendingDto>();
      const removeCampaignRejects = new Array<CampaignReject>();
      if (campaign.id === campaignId) {
        this.logger.debug('connectionPageOK_SendingRejectMessage traitement lancé');
        campaign.statut = this.statut.PROCESSING;
        await this.campaignService.create(campaign);
        this.socketService.emitClientEvent('updateListCampaign', 'OK');
        await sleep(myTime.TIME_APP_LOADING);
        const actionBeforeSendAllMessageResponse =
          await this.channelService.actionBeforeSendAllMessage(this.page);

        if (actionBeforeSendAllMessageResponse.statut) {
          for (const lastCampaignReject of lastCampaignRejects) {
            const contact = lastCampaignReject.contact;

            if (this.isStopped) {
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

        if (!this.isStopped) {
          if (campaignSendings.length > 0) {
            await this.campaignService.createSendings(campaignSendings);
            await this.campaignService.removeManyReject(removeCampaignRejects);
          }
          campaign.statut = this.statut.SENT;
          await this.campaignService.create(campaign);
          this.socketService.emitClientEvent('updateListCampaign', 'OK');
          await this.closeBrowserPage();
        } else {
          if (campaignSendings.length > 0) {
            await this.campaignService.createSendings(campaignSendings);
            await this.campaignService.removeManyReject(removeCampaignRejects);
          }
        }
      }
    });

    this.socketService.listenEvent(
      'cancelSendCampaignMessage',
      async (campaignId) => {
        if (campaign.id === campaignId) {
          this.logger.debug("annulation de l'envoi ", campaignId);
          this.isStopped = true;
          campaign.statut = this.statut.NOT_SENT;
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

  private getProfileDir(channelParam: string): string {
    const profileName = channelParam === this.channel.WHATS_APP ? '.whatsapp-profile' : '.instagram-profile';
    return path.join(__dirname, '..', '..', '..', profileName);
  }

  private async initBrowserPage(channelParam: string) {
    this.logger.log('initBrowserPage');

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

    const profileDir = this.getProfileDir(channelParam);
    this.logger.debug(`Profil persistant : ${profileDir}`);

    this.context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
    });
    this.page = await this.context.newPage();
    await this.page.goto(url);
  }

  private async closeBrowserPage() {
    await sleep(myTime.TIME_WAIT_END_ACTION);
    if (this.context) await this.context.close();
    this.context = undefined;
    this.browser = undefined;
    this.page = undefined;
  }
}
