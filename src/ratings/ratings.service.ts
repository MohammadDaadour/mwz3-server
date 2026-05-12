import { Injectable } from '@nestjs/common';
import { Rating } from './entities/rating.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateRatingDto } from './entities/rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating)
    private model: typeof Rating,
    private sql: Sequelize,
  ) {}

  async getRating(type: string, id: number) {
    const total = await this.model.sum('value', {
      where: { type: type, ref: id },
    });
    const count = await this.model.count({ where: { type: type, ref: id } });
    if (!total || !count) {
      return 0;
    } else {
      return total / count;
    }
  }

  async setRating(dto: CreateRatingDto) {
    const record = await this.model.findOne({
      where: { type: dto.type, ref: dto.ref, userFK: dto.userFK },
    });
    if (!record) {
      await this.model.create({ ...dto });
    } else {
      await record.update({ value: dto.value });
    }
  }
}
