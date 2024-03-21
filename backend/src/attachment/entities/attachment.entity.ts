import { Campaign } from 'src/campaign/entities/campaign.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'attachment' })
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  filename: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ nullable: false })
  type: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
}
