// transaction.entity.ts
import { Contract } from 'src/contracts/entities/contract.entity';
import { Freelancer } from 'src/users/entities/freelancer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  CLIENT_PAYMENT = 'client_payment',
  SCHEDULED_PAYOUT = 'scheduled_payout',
  INSTANT_WITHDRAWAL = 'instant_withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  amount: number; // in kobo

  @Column({ unique: true })
  reference: string; // Nomba ref or internal

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Freelancer, (freelancer) => freelancer.transactions)
  freelancer: Freelancer;

  @ManyToOne(() => Contract, (contract) => contract.transactions, {
    nullable: true,
  })
  contract: Contract;
}
