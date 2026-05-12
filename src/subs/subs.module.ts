import { Module } from '@nestjs/common';
import { SubsService } from './subs.service';
import { SubsController } from './subs.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sub } from './entities/sub.entity';

@Module({
  controllers: [SubsController],
  providers: [SubsService],
  imports: [SequelizeModule.forFeature([Sub])],
  exports: [SequelizeModule, SubsService],
})
export class SubsModule {}
