import { Group } from 'src/group/entities/group.entity';
import { IsNotEmpty } from 'class-validator';

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

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  idInsta: string;

  @ManyToMany((type) => Group, (group) => group.contacts)
  groups: Group[];

  equals(other) {
    return this.id === other.id;
  }
}
