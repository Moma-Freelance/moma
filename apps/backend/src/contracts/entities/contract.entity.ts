// contract.entity.ts
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Client } from 'src/users/entities/client.entity';
import { Freelancer } from 'src/users/entities/freelancer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContractStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  amount: number; // in kobo

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING_PAYMENT,
  })
  status: ContractStatus;

  @Column({ nullable: true, unique: true })
  nombaCheckoutRef: string;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.contracts)
  client: Client;

  @ManyToOne(() => Freelancer, (freelancer) => freelancer.contracts)
  freelancer: Freelancer;

  @OneToMany(() => Transaction, (transaction) => transaction.contract)
  transactions: Transaction[];
}
