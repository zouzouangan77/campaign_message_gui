import { Attachment } from 'src/attachment/entities/attachment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { CampaignSending } from './campaign_sending.entity';
import { CampaignReject } from './campaign_reject.entity';
import { Group } from 'src/group/entities/group.entity';

@Entity({ name: 'campaign' })
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ type: 'date', nullable: false })
  createDate: Date;

  @ManyToMany((type) => Attachment, (attachment) => attachment.campaigns, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'campaign_attachments', // table name for the junction table of this relation
    joinColumn: {
      name: 'campaign',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @ManyToMany((type) => Group)
  @JoinTable({
    name: 'campaign_groups', // table name for the junction table of this relation
    joinColumn: {
      name: 'campaign',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group',
      referencedColumnName: 'id',
    },
  })
  groups: Group[];

  @OneToMany(
    () => CampaignSending,
    (campaignSending) => campaignSending.campaign,
  )
  campaignSendings: CampaignSending[];

  @OneToMany(() => CampaignReject, (campaignReject) => campaignReject.campaign)
  campaignRejects: CampaignReject[];
}
