import { Campaign } from 'src/campaign/entities/campaign.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'group' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  comment: string;

  @ManyToMany((type) => Contact, (contact) => contact.groups, {
    //cascade: ['insert', 'update'],
    cascade: true,
  })
  @JoinTable({
    name: 'contact_groups', // table name for the junction table of this relation
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'contact_id',
      referencedColumnName: 'id',
    },
  })
  contacts: Contact[];
}
