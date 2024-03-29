import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { ContactService } from '../contact/contact.service';
import { CampaignService } from '../campaign/campaign.service';
import { campaignsProviders } from '../campaign/campaign.provider';
import { contactsProviders } from '../contact/contact.provider';
import { CsvService } from '../shared/csv.service';
import { SendingMessageService } from './sending.message.service';
import { DatabaseModule } from '../database/database.module';
import { WhatsappChannelService } from './channel/whatsapp.channel.service';
import { InstagramChannelService } from './channel/instagram.channel.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    SocketGateway,
    SocketService,
    SendingMessageService,
    ContactService,
    CampaignService,
    ...campaignsProviders,
    ...contactsProviders,
    CsvService,
    WhatsappChannelService,
    InstagramChannelService,
  ],
})
export class SocketModule {}
