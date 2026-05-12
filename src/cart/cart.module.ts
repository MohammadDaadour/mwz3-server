import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';
import { AdsModule } from 'src/ads/ads.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Cart, CartItem, Ad, User]),
    AdsModule,
    UsersModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
