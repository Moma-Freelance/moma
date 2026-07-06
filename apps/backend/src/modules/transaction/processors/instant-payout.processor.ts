import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository, DataSource } from 'typeorm';
import { Payout, PayoutStatus } from '../entities/payout.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { Freelancer } from 'src/modules/users/entities/freelancer.entity';
import { NombaHttpService } from 'src/modules/nomba/nomba-http.service';
import { ConfigService } from '@nestjs/config';

export interface InstantPayoutJobData {
  freelancerId: string;
  amount: number;
  contractId: string;
}

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

@Processor('payout-instant')
export class InstantPayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(InstantPayoutProcessor.name);
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

  async process(job: Job<InstantPayoutJobData>): Promise<void> {
    const { freelancerId, amount, contractId } = job.data;

    this.logger.log(
      `Processing instant payout for freelancer ${freelancerId}, amount: ${amount}`,
    );

    await this.dataSource.transaction(async (manager) => {
      const freelancer = await manager.findOne(Freelancer, {
        where: { id: freelancerId },
      });

      if (!freelancer) {
        this.logger.error(`Freelancer ${freelancerId} not found`);
        return;
      }

      if (freelancer.reservedBalance < amount) {
        this.logger.error(
          `Insufficient reserved balance for freelancer ${freelancerId}. ` +
            `Reserved: ${freelancer.reservedBalance}, Required: ${amount}`,
        );
        return;
      }

      if (!freelancer.accountHolderId) {
        this.logger.error(
          `Freelancer ${freelancerId} has no Nomba accountHolderId — cannot transfer`,
        );
        return;
      }

      const merchantTxRef = `INSTANT-${freelancerId}-${Date.now()}`;
      let transferResponse: NombaWalletTransferResponse;

      try {
        transferResponse =
          await this.nombaHttp.post<NombaWalletTransferResponse>(
            `/transfers/wallet/${this.subAccountId}`,
            {
              amount: amount / 100,
              receiverAccountId: freelancer.accountHolderId,
              merchantTxRef,
              narration: 'Moma instant payout',
            },
          );
      } catch (error: any) {
        this.logger.error(
          `Nomba transfer failed for freelancer ${freelancerId}`,
          error,
        );

        await manager.save(Payout, {
          freelancer: { id: freelancerId },
          amount,
          balanceBefore: freelancer.reservedBalance,
          balanceAfter: freelancer.reservedBalance,
          isScheduled: false,
          status: PayoutStatus.FAILED,
          failureReason: error?.message ?? 'Nomba transfer error',
          processedAt: new Date(),
        });
        return;
      }

      if (transferResponse.code !== '00') {
        this.logger.error(
          `Nomba transfer rejected for freelancer ${freelancerId}: ${transferResponse.description}`,
        );

        await manager.save(Payout, {
          freelancer: { id: freelancerId },
          amount,
          balanceBefore: freelancer.reservedBalance,
          balanceAfter: freelancer.reservedBalance,
          isScheduled: false,
          status: PayoutStatus.FAILED,
          failureReason: transferResponse.description,
          processedAt: new Date(),
        });
        return;
      }

      const balanceBefore = freelancer.reservedBalance;
      const balanceAfter = balanceBefore - amount;

      await manager.update(Freelancer, freelancerId, {
        reservedBalance: balanceAfter,
      });

      await manager.save(Payout, {
        freelancer: { id: freelancerId },
        amount,
        balanceBefore,
        balanceAfter,
        isScheduled: false,
        status: PayoutStatus.SUCCESS,
        nombaTransferRef: transferResponse.data.id,
        processedAt: new Date(),
      });

      await manager.save(Transaction, {
        freelancer: { id: freelancerId },
        contract: { id: contractId },
        type: TransactionType.INSTANT_WITHDRAWAL,
        status: TransactionStatus.SUCCESS,
        amount,
        reference: merchantTxRef,
        description: 'Instant payout to Nomba virtual account',
        metadata: {
          nombaTransferId: transferResponse.data.id,
          receiverAccountId: freelancer.accountHolderId,
        },
      });

      this.logger.log(
        `Instant payout successful for freelancer ${freelancerId}. ` +
          `Balance: ${balanceBefore} → ${balanceAfter}`,
      );
    });
  }
}
