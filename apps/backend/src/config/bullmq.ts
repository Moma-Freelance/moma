// import { ConfigModule, ConfigService } from '@nestjs/config';

// export const bullmqConfig = {
//     imports: [ConfigModule],
//      useFactory: (configService: ConfigService) => ({
//         connection: {
//         host: configService.get('BULL_MQ_HOST'),
//         port: configService.get('BULL_MQ_PORT'),
//       },
//       }),
//       inject: [ConfigService],
//     };

import { ConfigModule, ConfigService } from '@nestjs/config';

export const bullmqConfig = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL');

    if (redisUrl) {
      const url = new URL(redisUrl);

      return {
        connection: {
          host: url.hostname,
          port: Number(url.port) || 6379,
          username: url.username || undefined,
          password: url.password || undefined,
          maxRetriesPerRequest: null,
        },
        defaultJobOptions: {},
      };
    }

    return {
      connection: {
        host: configService.get('BULL_MQ_HOST'),
        port: configService.get('BULL_MQ_PORT'),
      },
    };
  },
  inject: [ConfigService],
};
