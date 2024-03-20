import { Contact } from 'src/contact/entities/contact.entity';
import { Campaign } from './campaign.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'campaign_sending' })
export class CampaignSending {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  sendingDate: Date;

  @ManyToOne(() => Contact)
  contact: Contact;

  @ManyToOne(() => Campaign, (campaign) => campaign.campaignSendings)
  campaign: Campaign;
}
