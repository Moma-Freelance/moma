import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WebhookEvent, WebhookStatus } from './entities/webhook-event.entity';
import { TransactionService } from '../transaction/transaction.service';
import {
  Contract,
  ContractStatus,
} from '../contracts/entities/contract.entity';

@Injectable()
export class NombaWebhookService {
  private readonly logger = new Logger(NombaWebhookService.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepo: Repository<WebhookEvent>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
  ) {}

  async processWebhook(
    payload: Record<string, any>,
    signature: string,
  ): Promise<void> {
    const isValid = this.verifySignature(payload, signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature — ignoring');
      return;
    }

    const nombaRef = payload.requestId;
    const eventType = payload.event_type;

    const existingEvent = await this.webhookEventRepo.findOne({
      where: { nombaRef },
    });
    if (existingEvent) {
      this.logger.warn(`Webhook ${nombaRef} already processed — skipping`);
      return;
    }

    const webhookEvent = await this.webhookEventRepo.save({
      nombaRef,
      eventType,
      payload,
      status: WebhookStatus.RECEIVED,
    });

    try {
      if (eventType === 'payment_success') {
        await this.handlePaymentSuccess(payload);
      } else {
        this.logger.log(`Unhandled event type: ${eventType} — ignoring`);
      }

      await this.webhookEventRepo.update(webhookEvent.id, {
        status: WebhookStatus.PROCESSED,
        processedAt: new Date(),
      });
    } catch (error: any) {
      this.logger.error(`Failed to process webhook ${nombaRef}`, error);

      await this.webhookEventRepo.update(webhookEvent.id, {
        status: WebhookStatus.FAILED,
        errorMessage: error?.message ?? 'Unknown error',
      });
    }
  }

  private async handlePaymentSuccess(
    payload: Record<string, any>,
  ): Promise<void> {
    const { transaction } = payload.data;

    const nombaTransactionId = transaction.transactionId;
    const amountInKobo = transaction.transactionAmount * 100;
    const orderReference = transaction.orderReference;

    const contract = await this.contractRepo.findOne({
      where: {
        id: orderReference,
        status: ContractStatus.PAYMENT_PENDING,
      },
      relations: ['freelancer'],
    });

    if (!contract) {
      this.logger.warn(
        `No PAYMENT_PENDING contract found for orderReference: ${orderReference}`,
      );
      return;
    }

    await this.contractRepo.update(contract.id, {
      status: ContractStatus.PAID,
      paidAt: new Date(),
    });

    this.logger.log(`Contract ${contract.id} marked as PAID`);

    await this.transactionService.handleIncomingPayment(
      contract.freelancer.id,
      amountInKobo,
      contract.id,
      nombaTransactionId,
    );
  }

  private verifySignature(
    payload: Record<string, any>,
    signature: string,
  ): boolean {
    const webhookSecret = this.configService.get<string>(
      'NOMBA_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      this.logger.warn(
        'NOMBA_WEBHOOK_SECRET not set — skipping signature verification',
      );
      return true;
    }

    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch {
      return false;
    }
  }
}
