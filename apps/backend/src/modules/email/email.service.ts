import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: ISendMailOptions['context'],
  ) {
    try {
      const from = this.configService.get<string>('EMAIL_FROM');
      const sendMailParams = {
        to,
        from,
        subject,
        template,
        context,
      };
      const response = await this.mailerService.sendMail(sendMailParams);
      this.logger.log(
        `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
          sendMailParams,
        )}`,
        response,
      );
    } catch (error) {
      this.logger.error(
        `Error while sending mail with the following parameters : ${JSON.stringify(
          { subject, template, context },
        )}`,
        error,
      );
    }
  }
}
