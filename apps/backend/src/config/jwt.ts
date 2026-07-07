import { ConfigModule, ConfigService } from '@nestjs/config';

export const jwtConfig = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
  }),
  inject: [ConfigService],
};
