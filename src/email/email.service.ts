import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
// import Mail from 'nodemailer/lib/mailer';
import { UsersService } from 'src/users/users.service';

interface EmailTokenPayload {
  email: string;
}

@Injectable()
export class EmailService {
  // private nodemailerTransport: Mail;
  private nodemailerTransport: Transporter;


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
    try {
      console.log('EmailService: Starting verification email process for:', email);

      // Check if email is provided
      if (!email || email.length === 0) {
        console.error('EmailService: Empty email provided');
        throw new BadRequestException('Email is required');
      }

      // Find the user
      console.log('EmailService: Looking for user with email:', email);
      const user = await this.usersService.findOneParams({ email: email });

      if (!user) {
        console.error('EmailService: User not found with email:', email);
        throw new BadRequestException('User not found');
      }

      console.log('EmailService: User found:', {
        id: user.id,
        email: user.email,
        activatedAt: user.activatedAt,
      });

      // Check if already activated
      if (user.activatedAt) {
        console.log('EmailService: User already activated at:', user.activatedAt);
        throw new BadRequestException('User already activated');
      }

      // Create JWT token
      console.log('EmailService: Creating JWT token for email verification');
      const payload: EmailTokenPayload = { email };
      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_EMAIL_SECRET'),
        expiresIn: this.configService.get('JWT_EMAIL_EXP'),
      });

      // Check if required config values exist
      const emailConfirmUrl = this.configService.get('EMAIL_CONFIRM_URL');
      console.log('EmailService: Email confirm URL:', emailConfirmUrl);

      if (!emailConfirmUrl) {
        console.error('EmailService: EMAIL_CONFIRM_URL not configured');
        throw new BadRequestException('Email confirmation URL not configured');
      }

      const url = `${emailConfirmUrl}?token=${token}`;
      const text = `مرحبا بك في MWZ3. لتأكيد بريدك الإلكتروني وتفعيل حسابك برجاء زيارة الرابط التالي: ${url}`;

      console.log('EmailService: Attempting to send email with options:', {
        from: 'noreply@mwz3.com',
        to: email,
        subject: 'MWZ3 Email confirmation',
        textLength: text.length,
      });

      try {
        const result = await this.sendMail({
          from: 'noreply@mwz3.com',
          to: email,
          subject: 'MWZ3 Email confirmation',
          text,
        });

        console.log('EmailService: Email sent successfully:', result);
        return true;

      } catch (emailError) {
        console.error('EmailService: Failed to send email:', {
          error: emailError.message,
          code: emailError.code,
          response: emailError.response,
          stack: emailError.stack,
        });
        throw new BadRequestException(`Failed to send email: ${emailError.message}`);
      }

    } catch (error) {
      console.error('EmailService: sendVerificationMail error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Re-throw BadRequestException with original message
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Wrap other errors
      throw new BadRequestException(`Email verification failed: ${error.message}`);
    }
  }

  async sendPasswordResetMail(email: string) {
    try {
      if (!email || email.length === 0) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.usersService.findOneParams({ email: email });

      if (!user) {
        console.error('EmailService: User not found with email:', email);
        throw new BadRequestException('User not found');
      }

      const payload: EmailTokenPayload = { email };
      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: this.configService.get('JWT_EMAIL_EXP'),
      });

      const url = `https://mwz3.com/reset-password?token=${token}`;
      const text = `لتغيير كلمة المرور اضغط علي الرابط التالي: ${url}`;

      try {
        const result = await this.sendMail({
          from: 'noreply@mwz3.com',
          to: email,
          subject: 'MWZ3 Account Password Reset',
          text,
        });
        console.log(result);
        return true;

      } catch (emailError) {
        throw new BadRequestException(`Failed to send email: ${emailError.message}`);
      }
    }
    catch (error: any) {
      throw new BadRequestException(error.message);
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

  async verifyResetToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
      });

      if (!payload?.email) throw new BadRequestException('bad');
      return payload.email;

    } catch (err) {
      if (err.name === 'TokenExpiredError') {
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
