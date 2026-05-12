import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';
import { AdsModule } from 'src/ads/ads.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, Ad, User]),
    AdsModule,
    UsersModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}