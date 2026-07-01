import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Freelancer } from 'src/users/entities/freelancer.entity';
import { Client } from 'src/users/entities/client.entity';
import { Contract } from 'src/contracts/entities/contract.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Payout } from 'src/transaction/entities/payout.entity';
import { WebhookEvent } from 'src/transaction/entities/webhook-event.entity';

export const jwtConfig = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
  }),
  inject: [ConfigService],
};
