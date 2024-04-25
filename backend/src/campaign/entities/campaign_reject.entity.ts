import { Contact } from 'src/contact/entities/contact.entity';
import { Campaign } from './campaign.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'campaign_reject' })
@Unique(['contact', 'campaign']) // Définir une contrainte d'unicité
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
