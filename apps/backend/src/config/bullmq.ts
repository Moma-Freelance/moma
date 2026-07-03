import { ConfigModule, ConfigService } from '@nestjs/config';

export const bullmqConfig = {
    imports: [ConfigModule],
     useFactory: (configService: ConfigService) => ({
        connection: {
        host: configService.get('BULL_MQ_HOST'),
        port: configService.get('BULL_MQ_PORT'),
      },
      }),
      inject: [ConfigService],
    };
    