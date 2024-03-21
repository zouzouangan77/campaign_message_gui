import { Campaign } from 'src/campaign/entities/campaign.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'group' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  comment: string;

  @ManyToMany((type) => Contact, (contact) => contact.groups)
  contacts: Contact[];
}
