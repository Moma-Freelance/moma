import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Freelancer } from 'src/modules/users/entities/freelancer.entity';
import { Payout } from './entities/payout.entity';
import { NombaModule } from 'src/modules/nomba/nomba.module';
import { InstantPayoutProcessor } from './processors/instant-payout.processor';
import { ScheduledPayoutProcessor } from './processors/scheduled-payout.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Payout, Freelancer]),
    BullModule.registerQueue(
      { name: 'payout-instant' },
      { name: 'payout-scheduled' },
    ),
    forwardRef(() => NombaModule),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    InstantPayoutProcessor,
    ScheduledPayoutProcessor,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
