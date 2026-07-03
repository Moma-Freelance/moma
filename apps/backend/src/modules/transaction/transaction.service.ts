import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { Payout } from './entities/payout.entity';
import {
  Freelancer,
  PayoutSchedule,
} from 'src/modules/users/entities/freelancer.entity';
import { InstantPayoutJobData } from './processors/instant-payout.processor';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Payout)
    private readonly payoutRepo: Repository<Payout>,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: Repository<Freelancer>,
    @InjectQueue('payout-instant')
    private readonly instantPayoutQueue: Queue,
    @InjectQueue('payout-scheduled')
    private readonly scheduledPayoutQueue: Queue,
    private readonly dataSource: DataSource,
  ) {}

  async registerScheduledPayoutCron(): Promise<void> {
    await this.scheduledPayoutQueue.add(
      'process-scheduled-payouts',
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // every day at midnight
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log('Scheduled payout cron registered');
  }

  async handleIncomingPayment(
    freelancerId: string,
    amount: number, // in kobo
    contractId: string,
    nombaRef: string, // from webhook
  ): Promise<void> {
    this.logger.log(
      `Handling incoming payment for freelancer ${freelancerId}, amount: ${amount}`,
    );

    await this.dataSource.transaction(async (manager) => {
      const freelancer = await manager.findOne(Freelancer, {
        where: { id: freelancerId },
      });

      if (!freelancer) {
        this.logger.error(`Freelancer ${freelancerId} not found`);
        return;
      }

      // 1. create CLIENT_PAYMENT transaction record
      await manager.save(Transaction, {
        freelancer: { id: freelancerId },
        contract: { id: contractId },
        type: TransactionType.CLIENT_PAYMENT,
        status: TransactionStatus.SUCCESS,
        amount,
        reference: nombaRef,
        description: 'Client payment received',
        metadata: { contractId, nombaRef },
      });

      // 2. add amount to reservedBalance
      const updatedReservedBalance = freelancer.reservedBalance + amount;
      await manager.update(Freelancer, freelancerId, {
        reservedBalance: updatedReservedBalance,
      });

      this.logger.log(
        `Reserved balance updated for freelancer ${freelancerId}: ` +
          `${freelancer.reservedBalance} → ${updatedReservedBalance}`,
      );

      // 3. route based on payout schedule
      if (freelancer.payoutSchedule === PayoutSchedule.INSTANT) {
        // add to instant payout queue
        await this.instantPayoutQueue.add(
          'instant-payout',
          {
            freelancerId,
            amount,
            contractId,
          } as InstantPayoutJobData,
          {
            attempts: 3, // retry up to 3 times if it fails
            backoff: {
              type: 'exponential',
              delay: 5000, // start with 5s, then 10s, then 20s
            },
          },
        );

        this.logger.log(
          `Instant payout job queued for freelancer ${freelancerId}`,
        );
      } else {
        // scheduled — money stays in reservedBalance
        // recalculate nextPayoutDate if not set
        if (!freelancer.nextPayoutDate) {
          const nextPayoutDate = this.calculateNextPayoutDate(
            freelancer.payoutSchedule,
          );
          await manager.update(Freelancer, freelancerId, { nextPayoutDate });

          this.logger.log(
            `Next payout date set for freelancer ${freelancerId}: ${nextPayoutDate}`,
          );
        }
      }
    });
  }

  private calculateNextPayoutDate(schedule: PayoutSchedule): Date {
    const now = new Date();
    switch (schedule) {
      case PayoutSchedule.WEEKLY:
        now.setDate(now.getDate() + 7);
        break;
      case PayoutSchedule.BIWEEKLY:
        now.setDate(now.getDate() + 14);
        break;
      case PayoutSchedule.MONTHLY:
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now;
  }

  findAll() {
    return this.transactionRepo.find();
  }

  findOne(id: string) {
    return this.transactionRepo.findOne({ where: { id } });
  }
}
