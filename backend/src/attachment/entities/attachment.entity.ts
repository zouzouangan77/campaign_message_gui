import { Campaign } from 'src/campaign/entities/campaign.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity({ name: 'attachment' })
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ type: 'text' })
  location: string;

  @ManyToMany((type) => Campaign, (campaign) => campaign.attachments)
  campaigns: Campaign[];
}
