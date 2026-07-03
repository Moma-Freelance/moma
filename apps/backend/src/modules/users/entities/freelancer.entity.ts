import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Contract } from 'src/modules/contracts/entities/contract.entity';
import { Payout } from 'src/modules/transaction/entities/payout.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';

export enum PayoutSchedule {
  INSTANT = 'instant',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum Professions {
  DEVELOPER = 'developer',
  UI_DESIGNER = 'uiDesigner',
  OTHER = 'other',
}

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Nomba virtual account
  @Column({ nullable: true })
  nombaVirtualAcctNo: string;

  @Column({ nullable: true })
  nombaBankName: string;

  @Column({ nullable: true })
  accountHolderId: string;

  @Column({ nullable: true })
  bankCode: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankAccountName: string;

  // Cached balances (in kobo)
  @Column({ default: 0 })
  availableBalance: number;

  @Column({ default: 0 })
  reservedBalance: number;

  // Payout config
  @Column({
    type: 'enum',
    enum: PayoutSchedule,
    default: PayoutSchedule.INSTANT,
  })
  payoutSchedule: PayoutSchedule;

  @Column({ nullable: true })
  payoutAmount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  nextPayoutDate: Date | null;

  @Column({
    type: 'enum',
    enum: Professions,
    default: Professions.OTHER,
  })
  profession: Professions;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.freelancer)
  @JoinColumn()
  user: User;

  @OneToMany(() => Contract, (contract) => contract.freelancer)
  contracts: Contract[];

  @OneToMany(() => Transaction, (transaction) => transaction.freelancer)
  transactions: Transaction[];

  @OneToMany(() => Payout, (payout) => payout.freelancer)
  payouts: Payout[];
}
