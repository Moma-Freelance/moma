import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Freelancer } from './entities/freelancer.entity';
import { Client } from './entities/client.entity';
import { NombaModule } from 'src/modules/nomba/nomba.module';
import { EmailModule } from '../email/email.module';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Payout } from '../transaction/entities/payout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Freelancer, Client, Transaction, Payout]),
    NombaModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
