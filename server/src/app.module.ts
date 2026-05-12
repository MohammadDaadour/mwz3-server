import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { AdsModule } from './ads/ads.module';
import { AreasModule } from './areas/areas.module';
import { ImagesModule } from './images/images.module';
import { EmailModule } from './email/email.module';
import { StateModule } from './state/state.module';
import { SubsModule } from './subs/subs.module';
import { SubstypesModule } from './substypes/substypes.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommentsModule } from './comments/comments.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentModule } from './payment/payment.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DBModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    AdsModule,
    AreasModule,
    ImagesModule,
    EmailModule,
    StateModule,
    SubsModule,
    SubstypesModule,
    RatingsModule,
    CommentsModule,
    MessagesModule,
    PaymentModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
