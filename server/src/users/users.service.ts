import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserDto, CreateUserDto, UpdateUserDto } from './entities/user.dto';
import { Sequelize } from 'sequelize-typescript';
import sequelize, { Op, where, col, cast,  } from 'sequelize';
import { Area } from 'src/areas/entities/area.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private model: typeof User,
    private sql: Sequelize,
  ) {}

  async findAll() {
    return await this.model.findAll();
  }

  async findAllIncl(page: number, role: string, query?: string) {
    const getQueryProp = () => {
      if (query) {
        return {
          [Op.or]: [
            where(cast(col('User.id'), 'varchar'), { [Op.like]: `%${query}%` }),
            { email: { [Op.like]: `%${query}%` } },
            { label: { [Op.like]: `%${query}%` } },
          ],
        };
      } else return null;
    };

    const getRoleProp = () => {
      if (role === 'su') {
        return null;
      } else {
        return { type: { [Op.or]: ['user', 'merch'] } };
      }
    };
    return await this.model.findAndCountAll({
      where: { ...getRoleProp(), ...getQueryProp() },
      paranoid: false,
      attributes: { exclude: ['hash'] },
      include: { model: Area },
      order: ['id'],
      limit: 15,
      offset: (page - 1) * 15,
    });
  }

  async findById(id: number) {
    const user = await this.model.findByPk(id, {
      attributes: { exclude: ['hash'] },
      include: { model: Area },
    });
    return user;
  }

  async findByIdIncl(id: number) {
    return await this.model.findByPk(id, { paranoid: false });
  }

  async findOneParams({ ...dto }: UserDto) {
    return await this.model.findOne({
      where: { ...dto },
      include: { all: true },
    });
  }

  async findOneParamsIncl({ ...dto }: UserDto) {
    return await this.model.findOne({
      where: { ...dto },
      paranoid: false,
    });
  }

  async findManyParam(ids: number[]) {
    return await this.model.findAll({ where: { id: { [Op.in]: ids } } });
  }

  async insertFavs(id: number, fav: number) {
    const record = await this.model.findByPk(id);
    if (record.favs.includes(fav)) {
      return null;
    }
    const modd = await record.update({
      favs: sequelize.fn('array_append', sequelize.col('favs'), fav),
    });
    return await modd.save();
  }

  async removeFavs(id: number, fav: number) {
    const record = await this.model.findByPk(id);
    const modd = await record.update({
      favs: sequelize.fn('array_remove', sequelize.col('favs'), fav),
    });
    return await modd.save();
  }

  async create(dto: CreateUserDto) {
    const record = this.model.build({ ...dto });
    return await record.save();
  }

  async update(id: number, dto: UpdateUserDto) {
    const record = await this.model.findByPk(id);
    const modd = await record?.update({ ...dto });
    return await modd?.save();
  }

  async remove(id: number) {
    return await this.model.destroy({ where: { id } });
  }

  async restore(id: number) {
    return await this.model.restore({ where: { id } });
  }
}
