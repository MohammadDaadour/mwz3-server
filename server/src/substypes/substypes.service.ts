import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SubType } from './entities/subtype.entity';
import { Area } from 'src/areas/entities/area.entity';
import { CreateSubTypeDto, UpdateSubTypeDto } from './entities/subtype.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SubstypesService {
  constructor(
    @InjectModel(SubType)
    private model: typeof SubType,
    private userService: UsersService
  ) {}

  async findAllIncl() {
    return await this.model.findAll({
      include: { model: Area },
      paranoid: false,
      order: ['areaFK', 'type'],
    });
  }

  async update(id: number, dto: UpdateSubTypeDto) {
    const record = await this.model.findByPk(id, { paranoid: false });
    const update = await record.update({ ...dto });
    update.save;
  }

  async delete(id: number) {
    await this.model.destroy({ where: { id: id } });
  }

  async restore(id: number) {
    const record = await this.model.findByPk(id, { paranoid: false });
    await record.restore();
  }

  async create(dto: CreateSubTypeDto) {
    await this.model.create({ ...dto });
  }

  async findFiltered(userId: number) {
    const user = await this.userService.findById(userId)
    const regionFK = user.area.id
    const result = await this.model.findAll({where: {areaFK: regionFK, active: true, deletedAt: null}})
    return result
  }
}
