import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Client } from 'src/modules/users/entities/client.entity';
import { Freelancer } from 'src/modules/users/entities/freelancer.entity';
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
  OPEN = 'open',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
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
    default: ContractStatus.OPEN,
  })
  status: ContractStatus;

  // @Column({ nullable: true, unique: true })
  // nombaCheckoutRef: string;
  @Column({ nullable: true })
  checkoutUrl: string;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.contracts)
  client: Client;

  @Column({ nullable: true })
  clientId: string;

  @ManyToOne(() => Freelancer, (freelancer) => freelancer.contracts)
  freelancer: Freelancer;

  @Column({ nullable: true })
  freelancerId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.contract)
  transactions: Transaction[];
}
