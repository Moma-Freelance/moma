// payout.entity.ts
import { Freelancer } from 'src/modules/users/entities/freelancer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity()
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number; // in kobo

  @Column()
  balanceBefore: number; // in kobo

  @Column()
  balanceAfter: number; // in kobo

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ default: true })
  isScheduled: boolean;

  @Column({ nullable: true })
  scheduledFor: Date | null;

  @Column({ nullable: true, unique: true })
  nombaTransferRef: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Freelancer, (freelancer) => freelancer.payouts)
  freelancer: Freelancer;
}
