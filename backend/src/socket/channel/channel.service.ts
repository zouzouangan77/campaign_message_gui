import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';

export interface ChannelService {
  sendMessage(
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse>;
}

export class SendMessageResponse {
  constructor(
  public statut: boolean,
  public error_message: string,
  ){}
}