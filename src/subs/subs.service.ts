import { Injectable } from '@nestjs/common';
import { Sub } from './entities/sub.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op, where, cast, col } from 'sequelize';
import { User } from 'src/users/entities/user.entity';
import { SubType } from 'src/substypes/entities/subtype.entity';
import { CreateSubDto, UpdateSubDto } from './entities/sub.dto';

@Injectable()
export class SubsService {
  constructor(
    @InjectModel(Sub)
    private model: typeof Sub,
  ) {}

  async findAllIncl(page: number, query?: string) {
    const getQueryProp = () => {
      if (query) {
        return {
          // [Op.or]: [
          //   where(cast(col('User.id'), 'varchar'), { [Op.like]: `%${query}%` }),
          //   { label: { [Op.like]: `%${query}%` } },
          // ],
          label: { [Op.like]: `%${query}%` },
        };
      } else return null;
    };
    return await this.model.findAndCountAll({
      paranoid: false,
      include: [
        { model: User, required: true, where: { ...getQueryProp() } },
        { model: SubType },
      ],
      order: [['createdAt', 'DESC']],
      limit: 15,
      offset: (page - 1) * 15,
    });
  }

  async findByUser(user: number) {
    const results = await this.model.findAll({
      where: { userFK: user },
      include: [SubType],
      paranoid: false,
      order: [['createdAt', 'DESC']],
    });
    return results;
  }

  async create(dto: CreateSubDto) {
    const record = await this.model.create({ ...dto });
    return record;
  }

  async update(id: number, dto: UpdateSubDto) {
    const record = await this.model.findByPk(id, { paranoid: false });
    const modd = await record.update({ ...dto });
    return await modd.save();
  }
}
