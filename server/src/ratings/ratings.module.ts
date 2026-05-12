import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rating } from './entities/rating.entity';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [SequelizeModule.forFeature([Rating])],
  exports: [SequelizeModule],
})
export class RatingsModule {}
