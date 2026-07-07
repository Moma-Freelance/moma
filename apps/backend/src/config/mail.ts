import { ConfigModule, ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter';

export const mailConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>('EMAIL_HOST'),
      port: configService.get<number>('EMAIL_PORT'),
      secure: configService.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: configService.get<string>('EMAIL_USERNAME'),
        pass: configService.get<string>('EMAIL_PASSWORD'),
      },
    },
    defaults: {
      from: configService.get<string>('EMAIL_FROM'),
    },
    template: {
      dir: __dirname + '/../templates',
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    },
  }),
};
