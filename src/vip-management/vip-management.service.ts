import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateVipManagementDto, LoginVipUserDto } from './dto/create-vip-management.dto';
import { UpdateVipManagementDto } from './dto/update-vip-management.dto';
import { InjectModel } from '@nestjs/sequelize';
import { VipUser } from './entities/vip-user.entity';
import * as bcrypt from 'bcrypt';
import { hash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RequestService } from '../request/request.service';
import { CreateRequestDto } from '../request/dto/create-request.dto';
import { Request, RequestStatus } from '../request/entities/request.entity';

@Injectable()
export class VipManagementService {

  constructor(
    @InjectModel(VipUser)
    private model: typeof VipUser,

    private jwtService: JwtService,

    private requestService: RequestService,
  ) { }
  async createUser(dto: CreateVipManagementDto) {

    const checkExist = await this.findOneParamsIncl({
      email: dto.email,
    });
    if (checkExist) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const userData = {
      name: dto.name,
      email: dto.email,
      password: hashed,
      credit: dto.credit
    }

    const record = this.model.build(userData);
    return await record.save();
  }

  async findOneParamsIncl(dto: Partial<CreateVipManagementDto>) {
    return await this.model.findOne({
      where: { ...dto },
      paranoid: false,
    });
  }

  async login(dto: LoginVipUserDto) {
    const user = await this.model.findOne({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      // Explicitly sign with the VIP secret to be 100% sure
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_VIP_SECRET
      }),
      user: { id: user.id, name: user.name, email: user.email, credit: user.credit },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOneParams({ email: email });
    if (!user) {
      throw new UnauthorizedException('mismatch');
    }

    const passCheck = await bcrypt.compare(password, user.password);
    if (!passCheck) {
      throw new UnauthorizedException('mismatch');
    }
    return user;
  }

  async getCookieLogin(id: number) {
    const payload = { sub: id };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async findOneParams(dto: Partial<CreateVipManagementDto>) {
    return await this.model.findOne({
      where: { ...dto },
      include: { all: true },
    });
  }

  async updateUserCredit(id: number, credit: number) {
    const user = await this.model.findByPk(id);
    if (!user) throw new NotFoundException('user not found');

    const amount = Number(credit);

    if (isNaN(amount)) {
      throw new BadRequestException('Invalid credit value');
    }

    if (Number(user.credit) + amount < 0) {
      throw new BadRequestException('not enough user credit');
    }

    user.credit = amount;

    return user.save();
  }

  findAll() {
    const users = this.model.findAll();

    return users;
  }

  async findOne(id: number) {
    return await this.model.findByPk(id);
  }

  remove(id: number) {
    return `This action removes a #${id} vipManagement`;
  }

  async sendRequest(userId: number, amount: number) {
    const user = await this.model.findByPk(userId, {
      include: [Request]
    });
    if (!user) throw new NotFoundException('user not found');

    if (Number(user.credit) - amount < 0) {
      throw new BadRequestException('not enough user credit');
    }

    const hasPending = user.requests?.some(req => req.status === RequestStatus.PENDING);

    if (hasPending) {
      throw new BadRequestException('you have a pending request');
    }

    return this.requestService.createRequest({ userId, amount });
  }

  async approveRequest(userId: number, requestId: number) {
    const user = await this.model.findByPk(userId);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const request = await this.requestService.getRequestById(requestId);
    if (!request) throw new NotFoundException('الطلب غير موجود');

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('الطلب ليس في حالة الانتظار');
    }

    if (Number(user.credit) - Number(request.amount) < 0) {
      throw new BadRequestException('ليس لديك رصيد كافٍ');
    }

    user.credit = Number(user.credit) - Number(request.amount);
    await user.save();

    request.status = RequestStatus.APPROVED;
    await request.save();

    return request;
  }

  async rejectRequest(userId: number, requestId: number) {
    const user = await this.model.findByPk(userId);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const request = await this.requestService.getRequestById(requestId);
    if (!request) throw new NotFoundException('الطلب غير موجود');

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('الطلب ليس في حالة الانتظار');
    }

    request.status = RequestStatus.REJECTED;
    await request.save();

    return request;
  }

  async getRequests(userId: number) {
    return this.requestService.findAll({ userId });
  }

  async getUserProfileWithRequests(userId: number) {
    const user = await this.model.findByPk(userId, {
      include: [
        {
          model: Request,
          separate: true,
          order: [['createdAt', 'DESC']]
        }
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
