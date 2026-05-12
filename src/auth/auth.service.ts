import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/tokenPayload.interface';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) { }

  async generateHash(str: string) {
    const hash = await bcrypt.hash(str, 10);
    return hash;
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    area: number,
    phone?: string,
  ) {
    try {
      const checkExist = await this.usersService.findOneParamsIncl({
        email: email,
      });
      if (checkExist) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashed = await bcrypt.hash(password, 10);
      const checkEmailService = await this.configService.get('EMAIL_ENABLED');

      const userData = {
        email: email,
        hash: hashed,
        type: 'user',
        label: name,
        phone: phone,
        activatedAt: checkEmailService === 'false' ? new Date() : null,
        areaFK: area,
      };

      const user = await this.usersService.create(userData);

      if (checkEmailService !== 'false') {
        const verificationEmail = await this.emailService.sendVerificationMail(
          user.email,
        );
        return { userId: user.id, verificationEmail };
      } else {
        return { userId: user.id };
      }

    } catch (error) {
      if (error.name?.includes('Sequelize')) {
        console.error('SQL Error Details:', {
          sql: error.sql,
          parameters: error.parameters,
          constraint: error.fields || error.constraint,
          table: error.table,
          column: error.column,
          value: error.value,
          detail: error.original?.detail,
          hint: error.original?.hint,
          code: error.original?.code,
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.fields ? Object.keys(error.fields)[0] : 'unknown';
        throw new BadRequestException(`User with this ${field} already exists`);
      }

      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value,
        }));
        console.error('Validation errors:', validationErrors);
        throw new BadRequestException(`Validation failed: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
      }

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new BadRequestException(`Invalid area ID: ${area}. Area does not exist.`);
      }

      if (error.name === 'SequelizeConnectionError') {
        throw new InternalServerErrorException('Database connection error');
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user. Please try again.');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneParams({ email: email });
    if (!user) {
      throw new UnauthorizedException('mismatch');
    }
    const passCheck = await bcrypt.compare(password, user.hash);
    if (!passCheck) {
      throw new UnauthorizedException('mismatch');
    }
    if (user.activatedAt === null) {
      throw new UnauthorizedException('inactive');
    }
    return user;
  }

  async getCookieLogin(id: number, role: string, remember: boolean) {
    const payload: TokenPayload = { sub: id, role: role };
    const token = await this.jwtService.signAsync(payload);
    return token;
    if (remember) {
      return `Auth=${token}; HttpOnly; Path=/; Secure=false; Max-Age=${this.configService.get('COOKIE_EXP')};`;
    } else {
      return `Auth=${token}; HttpOnly; Path=/; Secure=false;`;
    }
  }

  async getCookieLogout() {
    return `Auth=; HttpOnly=; Path=/; Max-Age=0`;
  }


  async updatePassword(id: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    await this.usersService.update(id, { hash: hashed });
  }

  async facebookLogin(payload: any) {
    const user = await this.usersService.findOneParams({
      email: payload.user.email,
    });
    try {
      if (!user) {
        const hashed = await bcrypt.hash(payload.accessToken.slice(0, 10), 10);
        const newUser = await this.usersService.create({
          email: payload.user.email,
          hash: hashed,
          type: 'user',
          label: payload.user.name,
          activatedAt: new Date(),
          facebook: true,
        });
        return await this.getCookieLogin(newUser.id, newUser.type, true);
      } else {
        if (!user.facebook) {
          await this.usersService.update(user.id, { facebook: true });
        }
        if (user.activatedAt === null) {
          await this.usersService.update(user.id, { activatedAt: new Date() });
        }
        return await this.getCookieLogin(user.id, user.type, true);
      }
    } catch {
      throw new BadRequestException();
    }
  }

  async googleLogin(payload: any) {
    const user = await this.usersService.findOneParams({
      email: payload.user.email,
    });
    try {
      if (!user) {
        const hashed = await bcrypt.hash(payload.accessToken.slice(0, 10), 10);
        const newUser = await this.usersService.create({
          email: payload.user.email,
          hash: hashed,
          type: 'user',
          label: payload.user.name,
          activatedAt: new Date(),
          google: true,
        });
        return await this.getCookieLogin(newUser.id, newUser.type, true);
      } else {
        if (!user.google) {
          await this.usersService.update(user.id, { google: true });
        }
        if (user.activatedAt === null) {
          await this.usersService.update(user.id, { activatedAt: new Date() });
        }
        return await this.getCookieLogin(user.id, user.type, true);
      }
    } catch {
      throw new BadRequestException();
    }
  }

  async updatePasswordByEmail(email: string, password: string) {
    const user = await this.usersService.findOneParams({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashed = await bcrypt.hash(password, 10);
    await this.usersService.update(user.id, { hash: hashed });
  }


  async resetPassword(token: string, password: string) {
    const email = await this.emailService.verifyResetToken(token);
    await this.updatePasswordByEmail(email, password);
  }
}
