import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ContactUsDto } from './dto/contact-us.dto';
import { EmailService } from './email.service';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { AuthenticatedGuard } from 'src/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CONFIG } from 'src/constants/config.constant';
import { ConfigService } from '@nestjs/config';

@Controller('email')
@ApiTags('Emailing APIs')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
export class EmailController {
  senderEmail: string;
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.senderEmail = this.configService.getOrThrow<string>(CONFIG.AWS_SES_SENDER);
  }

  @Post('contact-us')
  async sendEmail(@Body() dto: ContactUsDto) {
    const { subject, description } = dto;

    const bodyHtml = `
    <p>Subject: ${subject}</p>
    <p>Description: ${description}</p>
    `;

    await this.emailService.sendEmail(this.senderEmail, subject, bodyHtml);
    return SerializeHttpResponse(null, HttpStatus.OK, 'Email sent successfully');
  }
}
