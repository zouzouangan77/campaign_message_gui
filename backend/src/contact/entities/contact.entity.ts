import { Group } from 'src/group/entities/group.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'contact' })
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  idInsta: string;

  @ManyToMany((type) => Group, (group) => group.contacts, {
    cascade: ["insert", "update"],
})
  @JoinTable({
    name: 'contact_groups', // table name for the junction table of this relation
    joinColumn: {
      name: 'contact',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group',
      referencedColumnName: 'id',
    },
  })
  groups: Group[];
}
