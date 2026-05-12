import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Image } from './entities/image.entity';
import { UsersModule } from 'src/users/users.module';
import { AdsModule } from 'src/ads/ads.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [SequelizeModule.forFeature([Image]), UsersModule, AdsModule],
  exports: [SequelizeModule],
})
export class ImagesModule {}
