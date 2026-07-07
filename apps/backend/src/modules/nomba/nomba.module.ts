import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';
import { WebhookEvent } from './entities/webhook-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '../contracts/entities/contract.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { NombaWebhookService } from './nomba-webhook.service';
import { NombaWebhookController } from './nomba-webhook.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WebhookEvent, Contract]),
    forwardRef(() => TransactionModule),
  ],
  controllers: [NombaWebhookController],
  providers: [NombaHttpService, NombaWebhookService],
  exports: [NombaHttpService],
})
export class NombaModule {}
