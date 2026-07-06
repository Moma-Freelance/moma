import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NombaWebhookService } from './nomba-webhook.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
export class NombaWebhookController {
  private readonly logger = new Logger(NombaWebhookController.name);

  constructor(private readonly webhookService: NombaWebhookService) {}

  @Public()
  @Post('nomba')
  @HttpCode(200)
  @ApiOperation({ summary: 'Nomba webhook receiver' })
  async handleNombaWebhook(
    @Body() payload: Record<string, any>,
    @Headers('x-nomba-signature') signature: string,
  ) {
    this.logger.log(`Webhook received: ${payload?.event_type}`);

    this.webhookService.processWebhook(payload, signature).catch((error) => {
      this.logger.error('Webhook processing error', error);
    });

    return { received: true };
  }
}
