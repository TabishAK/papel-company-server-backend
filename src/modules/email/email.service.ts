import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'src/constants/config.constant';

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.sesClient = new SESClient({
      region: this.configService.get<string>(CONFIG.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.AWS_ACCESS_KEY) ?? '',
        secretAccessKey: this.configService.get<string>(CONFIG.AWS_SECRET_KEY) ?? '',
      },
    });
  }

  async loadTemplate(templateName: string, context: Record<string, any>) {
    const filePath = path.resolve(`src/email-templates/${templateName}.hbs`);
    const templateSource = fs.readFileSync(filePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    return template(context);
  }

  async sendEmail(to: string, subject: string, bodyHtml = '', bodyText?: string) {
    const sender = this.configService.get<string>(CONFIG.AWS_SES_SENDER) || 'hello@bts1c.com';

    const input: SendEmailCommandInput = {
      Source: sender,

      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: bodyText },
          ...(bodyHtml && { Html: { Data: bodyHtml } }),
        },
      },
    };

    try {
      const command = new SendEmailCommand(input);
      const response = await this.sesClient.send(command);
      console.log('✅ SES email sent successfully');
      return response;
    } catch (error) {
      console.log('❌ SES email failed:', error.message);
      throw error;
    }
  }
}
