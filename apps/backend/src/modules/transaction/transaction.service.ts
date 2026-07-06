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
import { calculateNextPayoutDate } from 'src/core/utils/payout.utils';
import { TransactionQueryDto } from './dto/transaction-query.dto';

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
          pattern: '0 0 * * *',
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log('Scheduled payout cron registered');
  }

  async handleIncomingPayment(
    freelancerId: string,
    amount: number,
    contractId: string,
    nombaRef: string,
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

      const updatedReservedBalance = freelancer.reservedBalance + amount;
      await manager.update(Freelancer, freelancerId, {
        reservedBalance: updatedReservedBalance,
      });

      this.logger.log(
        `Reserved balance updated for freelancer ${freelancerId}: ` +
          `${freelancer.reservedBalance} → ${updatedReservedBalance}`,
      );

      if (freelancer.payoutSchedule === PayoutSchedule.INSTANT) {
        await this.instantPayoutQueue.add(
          'instant-payout',
          {
            freelancerId,
            amount,
            contractId,
          } as InstantPayoutJobData,
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        );

        this.logger.log(
          `Instant payout job queued for freelancer ${freelancerId}`,
        );
      } else {
        if (!freelancer.nextPayoutDate) {
          const nextPayoutDate = calculateNextPayoutDate(
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
  async getFreelancerTransactions(
    freelancerId: string,
    query: TransactionQueryDto,
  ) {
    const { type, status, from, to, page = 1, limit = 5 } = query;

    const qb = this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.freelancerId = :freelancerId', { freelancerId })
      .orderBy('transaction.createdAt', 'DESC');

    if (type) {
      qb.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      qb.andWhere('transaction.status = :status', { status });
    }

    if (from) {
      qb.andWhere('transaction.createdAt >= :from', {
        from: new Date(from),
      });
    }

    if (to) {
      qb.andWhere('transaction.createdAt <= :to', {
        to: new Date(to),
      });
    }

    const total = await qb.getCount();

    const transactions = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
