import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';
import { Freelancer } from 'src/modules/users/entities/freelancer.entity';
import { Client } from 'src/modules/users/entities/client.entity';
import { Contract } from 'src/modules/contracts/entities/contract.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Payout } from 'src/modules/transaction/entities/payout.entity';
import { WebhookEvent } from 'src/modules/nomba/entities/webhook-event.entity';

const entities = [
  User,
  Freelancer,
  Client,
  Contract,
  Transaction,
  Payout,
  WebhookEvent,
];

export const databaseConfig = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const isProd = configService.get('NODE_ENV') === 'production';

    const base = databaseUrl
      ? { url: databaseUrl }
      : {
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
        };

    return {
      type: 'postgres' as const,
      ...base,
      entities,
      synchronize: true,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };
  },
  inject: [ConfigService],
  dataSourceFactory: async (options) => {
    try {
      const dataSource = await new DataSource(options).initialize();
      console.log('DB connected successfully');
      return dataSource;
    } catch (error) {
      console.error('DB connection failed', error);
      throw error;
    }
  },
};
