import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { UsersService } from 'src/users/users.service';

interface EmailTokenPayload {
  email: string;
}

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.nodemailerTransport = createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: 465,
      secure: true,
      requireTLS: true,
      tls: { ciphers: 'SSLv3' },
      connectionTimeout: 10000,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }

  async sendVerificationMail(email: string) {
    if (email.length === 0) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findOneParams({ email: email });
    if (user.activatedAt) {
      throw new BadRequestException('already activated');
    }

    const payload: EmailTokenPayload = { email };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_EMAIL_SECRET'),
      expiresIn: this.configService.get('JWT_EMAIL_EXP'),
    });
    const url = `${this.configService.get('EMAIL_CONFIRM_URL')}?token=${token}`;
    const text = `مرحبا بك في MWZ3. لتأكيد بريدك الإلكتروني وتفعيل حسابك برجاء زيارة الرابط التالي: ${url}`;

    try {
      await this.sendMail({
        from: 'noreply@mwz3.com',
        to: email,
        subject: 'MWZ3 Email confirmation',
        text,
      });
      return true;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async verifyEmailToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_EMAIL_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        throw new BadRequestException('expired');
      }
      throw new BadRequestException('bad');
    }
  }

  async activateUserAccount(email: string) {
    const user = await this.usersService.findOneParams({ email: email });
    if (user.activatedAt) {
      throw new BadRequestException('already activated');
    }
    await this.usersService.update(user.id, { activatedAt: new Date() });
  }
}
