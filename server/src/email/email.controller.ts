import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('activate')
  async activateAccount(@Body('token') token: string) {
    const email = await this.emailService.verifyEmailToken(token);
    await this.emailService.activateUserAccount(email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('request')
  async sendActivationEmail(@Body('email') email: string) {
    await this.emailService.sendVerificationMail(email);
  }
}
