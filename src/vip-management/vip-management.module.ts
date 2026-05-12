import { Module } from '@nestjs/common';
import { VipManagementService } from './vip-management.service';
import { VipJwtStrategy } from './strategies/vip-jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { VipManagementController } from './vip-management.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { VipUser } from './entities/vip-user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';
import { Request } from '../request/entities/request.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([VipUser, Request]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_VIP_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXP') },
      }),
    }),
    RequestModule,
  ],
  controllers: [VipManagementController],
  providers: [VipManagementService, RequestService, VipJwtStrategy],
})
export class VipManagementModule { }
