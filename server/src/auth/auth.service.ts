import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
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
  ) {}

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
    const chekcExist = await this.usersService.findOneParamsIncl({
      email: email,
    });
    if (chekcExist) {
      throw new BadRequestException('exists');
    }
    const hashed = await bcrypt.hash(password, 10);

    const checkEmailService = await this.configService.get('EMAIL_ENABLED');

    const user = await this.usersService.create({
      email: email,
      hash: hashed,
      type: 'user',
      label: name,
      phone: phone,
      activatedAt: checkEmailService === 'false' ? new Date() : null,
      areaFK: area,
    });

    if (checkEmailService !== 'false') {
      const verificationEmail = await this.emailService.sendVerificationMail(
        user.email,
      );
      return user.id, verificationEmail;
    } else {
      return user.id;
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
      throw new UnauthorizedException('unactive');
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
}
