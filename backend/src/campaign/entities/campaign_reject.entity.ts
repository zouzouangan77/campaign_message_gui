import { Contact } from 'src/contact/entities/contact.entity';
import { Campaign } from './campaign.entity';
import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';

@Entity({ name: 'campaign_reject' })
export class CampaignReject {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  rejectDate: Date;

  @Column({ type: 'text' })
  cause: string;

  @ManyToOne(() => Contact)
  contact: Contact;

  @ManyToOne(() => Campaign, (campaign) => campaign.campaignSendings)
  campaign: Campaign;
}
