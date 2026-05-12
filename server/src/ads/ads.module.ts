import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ad } from './entities/ad.entity';
import { AreasModule } from 'src/areas/areas.module';
import { UsersModule } from 'src/users/users.module';
import { SubsModule } from 'src/subs/subs.module';

@Module({
  controllers: [AdsController],
  providers: [AdsService],
  imports: [SequelizeModule.forFeature([Ad]), AreasModule, UsersModule, SubsModule],
  exports: [SequelizeModule, AdsService],
})
export class AdsModule {}
