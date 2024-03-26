import { Attachment } from 'src/attachment/entities/attachment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CampaignSending } from './campaign_sending.entity';
import { CampaignReject } from './campaign_reject.entity';
import { Group } from 'src/group/entities/group.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity({ name: 'campaign' })
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @Column({
    type: 'varchar',
    nullable: false,
    enum: ['NOT_SENT', 'PROCESSING', 'SENT'],
    default: 'NOT_SENT',
  })
  statut: string;

  @Column({
    type: 'varchar',
    nullable: false,
    enum: ['WHATAPPS', 'INSTAGRAM'],
    default: 'WHATAPPS',
  })
  canal: string;

  @ManyToOne((type) => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToMany((type) => Attachment, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'campaign_attachments', // table name for the junction table of this relation
    joinColumn: {
      name: 'campaign_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];

  @ManyToMany((type) => Group)
  @JoinTable({
    name: 'campaign_groups', // table name for the junction table of this relation
    joinColumn: {
      name: 'campaign_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group_id',
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
