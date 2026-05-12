import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { UsersModule } from 'src/users/users.module';


@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [ConfigModule, HttpModule, SequelizeModule.forFeature([Payment]), UsersModule], 
})
export class PaymentModule { }
