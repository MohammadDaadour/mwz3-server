import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [SequelizeModule.forFeature([Category])],
  exports: [SequelizeModule],
})
export class CategoriesModule {}
