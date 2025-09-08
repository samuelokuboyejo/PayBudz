import { IsAlphanumeric } from 'class-validator';
import { AuthProvider } from 'src/enums/auth-provider.enum';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @IsAlphanumeric()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  username: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  wallets: Partial<Record<SupportedCurrencies, string>>;

  @Column({ type: 'jsonb', nullable: true })
  authProvider: Partial<Record<AuthProvider, string>>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column()
  firebaseUid: string;
}
