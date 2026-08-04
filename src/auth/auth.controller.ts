import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LocalGuard } from './guards/local.guard';
import { Public } from './decorators/public.decorator';
import { Response, Request } from 'express';
import { ReqJwt, ReqUser } from './interfaces/reqUser.interface';
import { UserDto } from 'src/users/entities/user.dto';
import { RegisterDto } from './interfaces/auth.dto';
import { FacebookGuard } from './guards/facebook.guard';
import { GoogleGuard } from './guards/google.guard';

@Controller()
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('hash')
  async genHash(@Body() dto: { str: string }) {
    return await this.service.generateHash(dto.str);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.service.createUser(
      dto.email,
      dto.pass,
      dto.name,
      +dto.area,
      dto.phone ? dto.phone : null,
    );
  }

  @Public()
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: ReqUser,
    @Res() res: Response,
    @Body() dto: { remember: boolean },
  ) {
    // function delay(ms) {
    //   return new Promise((resolve) => setTimeout(resolve, ms));
    // }
    const user: UserDto = req.user;
    const cookie = await this.service.getCookieLogin(
      user.id,
      user.type,
      dto.remember,
    );
    // await delay(10000);
    // res.setHeader('Set-Cookie', cookie);
    return res.json(cookie);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res() res: Response) {
    const cookie = await this.service.getCookieLogout();
    res.setHeader('Set-Cookie', cookie);
    return res.json({ success: true });
  }

  @Get('validate')
  async validate(@Req() req: ReqJwt) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update-password')
  async updatePassword(@Req() req: ReqJwt, @Body() dto: { password: string }) {
    await this.service.updatePassword(req.user.id, dto.password);
  }

  @Public()
  @UseGuards(FacebookGuard)
  @Get('/facebook')
  async fbLogin() {
    return HttpStatus.OK;
  }

  @Public()
  @UseGuards(FacebookGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/facebook/redirect')
  async fbLoginRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
  ) {
    const cookie = await this.service.facebookLogin(req.user);
    return res.json(cookie);
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('/google')
  async googleLogin() {
    return HttpStatus.OK;
  }

  @Public()
  @UseGuards(GoogleGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/google/redirect')
  async googleLoginRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const cookie = await this.service.googleLogin(req.user);
      return res.json(cookie);
    } catch (error) {
      console.error('Google login redirect failed:', { name: error.name, message: error.message });
      return res.status(error.status || 400).json({ error: error.message || 'Google login failed' });
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; password: string }) {
    await this.service.resetPassword(dto.token, dto.password);
  }
}
