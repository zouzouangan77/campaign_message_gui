import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';

export interface ChannelService {
  sendMessage(
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<boolean>;
}
