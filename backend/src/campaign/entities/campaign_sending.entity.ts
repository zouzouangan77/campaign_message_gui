import { Contact } from 'src/contact/entities/contact.entity';
import { Campaign } from './campaign.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'campaign_sending' })
@Unique(['contact', 'campaign']) // Définir une contrainte d'unicité
export class CampaignSending {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  sendingDate: Date;

  @ManyToOne(() => Contact)
  contact: Contact;

  @ManyToOne(() => Campaign, (campaign) => campaign.campaignSendings)
  campaign: Campaign;
}
