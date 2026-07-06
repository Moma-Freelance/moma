import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import {
  Repository,
  DataSource,
  LessThanOrEqual,
  MoreThan,
  Not,
} from 'typeorm';
import { Payout, PayoutStatus } from '../entities/payout.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import {
  Freelancer,
  PayoutSchedule,
} from 'src/modules/users/entities/freelancer.entity';
import { NombaHttpService } from 'src/modules/nomba/nomba-http.service';
import { calculateNextPayoutDate } from 'src/core/utils/payout.utils';
import { ConfigService } from '@nestjs/config';

interface NombaWalletTransferResponse {
  code: string;
  description: string;
  data: {
    id: string;
    status: string;
    amount: number;
    fee: number;
  };
}

@Processor('payout-scheduled')
export class ScheduledPayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledPayoutProcessor.name);
  private readonly subAccountId: string;
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepo: Repository<Payout>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: Repository<Freelancer>,
    private readonly dataSource: DataSource,
    private readonly nombaHttp: NombaHttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.subAccountId = this.configService.get<string>('NOMBA_SUB_ACCOUNT_ID')!;
  }

  async process(job: Job): Promise<void> {
    this.logger.log('Scheduled payout cron fired — checking due freelancers');

    const dueFrelancers = await this.freelancerRepo.find({
      where: {
        payoutSchedule: Not(PayoutSchedule.INSTANT),
        nextPayoutDate: LessThanOrEqual(new Date()),
        reservedBalance: MoreThan(0),
      },
    });

    this.logger.log(`Found ${dueFrelancers.length} freelancers due for payout`);

    for (const freelancer of dueFrelancers) {
      await this.processFreelancerPayout(freelancer);
    }
  }

  private async processFreelancerPayout(freelancer: Freelancer): Promise<void> {
    const isPartialPayout =
      freelancer.reservedBalance < freelancer.payoutAmount;
    const amountToTransfer = isPartialPayout
      ? freelancer.reservedBalance
      : freelancer.payoutAmount;

    this.logger.log(
      `Processing ${isPartialPayout ? 'partial' : 'full'} payout for freelancer ${freelancer.id}. ` +
        `Amount: ${amountToTransfer}, Reserved: ${freelancer.reservedBalance}`,
    );

    if (!freelancer.accountHolderId) {
      this.logger.error(
        `Freelancer ${freelancer.id} has no Nomba accountHolderId — skipping`,
      );
      return;
    }

    const merchantTxRef = `SCHEDULED-${freelancer.id}-${Date.now()}`;

    await this.dataSource.transaction(async (manager) => {
      let transferResponse: NombaWalletTransferResponse;

      try {
        transferResponse =
          await this.nombaHttp.post<NombaWalletTransferResponse>(
            `/transfers/wallet/${this.subAccountId}`,
            {
              amount: amountToTransfer / 100,
              receiverAccountId: freelancer.accountHolderId,
              merchantTxRef,
              narration: `Moma ${freelancer.payoutSchedule} payout`,
            },
          );
      } catch (error: any) {
        this.logger.error(
          `Nomba transfer failed for freelancer ${freelancer.id}`,
          error,
        );

        await manager.save(Payout, {
          freelancer: { id: freelancer.id },
          amount: amountToTransfer,
          balanceBefore: freelancer.reservedBalance,
          balanceAfter: freelancer.reservedBalance,
          isScheduled: true,
          scheduledFor: freelancer.nextPayoutDate ?? null,
          status: PayoutStatus.FAILED,
          failureReason: error?.message ?? 'Nomba transfer error',
          processedAt: new Date(),
        });

        // TODO: notify freelancer of failed payout
        return;
      }

      if (transferResponse.code !== '00') {
        this.logger.error(
          `Nomba transfer rejected for freelancer ${freelancer.id}: ${transferResponse.description}`,
        );

        await manager.save(Payout, {
          freelancer: { id: freelancer.id },
          amount: amountToTransfer,
          balanceBefore: freelancer.reservedBalance,
          balanceAfter: freelancer.reservedBalance,
          isScheduled: true,
          scheduledFor: freelancer.nextPayoutDate,
          status: PayoutStatus.FAILED,
          failureReason: transferResponse.description,
          processedAt: new Date(),
        });

        // TODO: notify freelancer of failed payout
        return;
      }

      const balanceBefore = freelancer.reservedBalance;
      const balanceAfter = balanceBefore - amountToTransfer;

      await manager.update(Freelancer, freelancer.id, {
        reservedBalance: balanceAfter,
        nextPayoutDate:
          balanceAfter > 0
            ? calculateNextPayoutDate(freelancer.payoutSchedule)
            : null,
      });

      await manager.save(Payout, {
        freelancer: { id: freelancer.id },
        amount: amountToTransfer,
        balanceBefore,
        balanceAfter,
        isScheduled: true,
        scheduledFor: freelancer.nextPayoutDate,
        status: PayoutStatus.SUCCESS,
        nombaTransferRef: transferResponse.data.id,
        processedAt: new Date(),
      });

      await manager.save(Transaction, {
        freelancer: { id: freelancer.id },
        type: TransactionType.SCHEDULED_PAYOUT,
        status: TransactionStatus.SUCCESS,
        amount: amountToTransfer,
        reference: merchantTxRef,
        description: isPartialPayout
          ? `Partial ${freelancer.payoutSchedule} payout — balance lower than set amount`
          : `${freelancer.payoutSchedule} payout`,
        metadata: {
          nombaTransferId: transferResponse.data.id,
          receiverAccountId: freelancer.accountHolderId,
          isPartialPayout,
        },
      });

      this.logger.log(
        `Scheduled payout successful for freelancer ${freelancer.id}. ` +
          `Balance: ${balanceBefore} → ${balanceAfter}`,
      );

      // TODO: notify freelancer
      // if partial: "Your balance was lower than your set payout amount.
      //              ₦X has been sent to your Nomba account."
      // if full: "Your scheduled payout of ₦X has been sent to your Nomba account."
    });
  }
}
