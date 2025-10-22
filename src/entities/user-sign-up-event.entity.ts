import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class UserSignupEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
