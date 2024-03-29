import { Injectable } from '@nestjs/common';
import {ChannelService, SendMessageResponse} from './channel.service';
import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';

@Injectable()
export class InstagramChannelService implements ChannelService {
  public async sendMessage(
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse> {
    return new SendMessageResponse(false, '');
  }
}
