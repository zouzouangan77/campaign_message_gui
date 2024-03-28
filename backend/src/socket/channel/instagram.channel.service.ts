import { Injectable } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';

@Injectable()
export class InstagramChannelService implements ChannelService {
  public async sendMessage(
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<boolean> {
    return false;
  }
}
