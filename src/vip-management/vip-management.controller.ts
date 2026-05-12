import {
  Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VipManagementService } from './vip-management.service';
import { CreateVipManagementDto, LoginVipUserDto } from './dto/create-vip-management.dto';
import { UpdateVipManagementDto } from './dto/update-vip-management.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateRequestDto } from 'src/request/dto/create-request.dto';
import { Response } from 'express';
import { VipJwtGuard, VipJwtStrategy } from './strategies/vip-jwt.strategy';

@Controller('vip-management')
export class VipManagementController {
  constructor(private readonly vipManagementService: VipManagementService) { }

  @Post()
  @Roles('admin')
  create(@Body() createVipManagementDto: CreateVipManagementDto) {
    return this.vipManagementService.createUser(createVipManagementDto);
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginVipUserDto, @Res({ passthrough: true }) res: Response,) {
    const result = await this.vipManagementService.login(loginDto);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: undefined,
      path: '/',
      maxAge: 60 * 60 * 24 * 1 * 1000,
    });

    return result;
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.vipManagementService.findAll();
  }

  @Patch(':id')
  @Public()
  updateUserCredit(@Param('id') id: string, @Body('credit') credit: number) {
    return this.vipManagementService.updateUserCredit(+id, credit);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vipManagementService.remove(+id);
  }

  @Post('send-request')
  @Public()
  @UseGuards(VipJwtGuard)
  sendRequest(@Req() req: any, @Body() body: { amount: number }) {
    return this.vipManagementService.sendRequest(req.user.id, body.amount);
  }

  @Get('profile/me')
  @Public()
  @UseGuards(VipJwtGuard)
  async getMyProfile(@Req() req: any) {
    return this.vipManagementService.getUserProfileWithRequests(req.user.id);
  }

  @Get('profile/:id')
  @Roles('admin')
  getProfileWithRequests(@Param('id') id: string) {
    return this.vipManagementService.getUserProfileWithRequests(+id);
  }

  @Patch('approve-request/:userId/:requestId')
  @Roles('admin')
  approveRequest(@Param('userId') userId: string, @Param('requestId') requestId: string) {
    return this.vipManagementService.approveRequest(+userId, +requestId);
  }

  @Patch('reject-request/:userId/:requestId')
  @Roles('admin')
  rejectRequest(@Param('userId') userId: string, @Param('requestId') requestId: string) {
    return this.vipManagementService.rejectRequest(+userId, +requestId);
  }
}
