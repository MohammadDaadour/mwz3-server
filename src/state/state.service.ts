import { Injectable } from '@nestjs/common';
import { State } from './entities/state.entity';
import { InjectModel } from '@nestjs/sequelize';
import { StateDto, CreateStateDto, UpdateStateDto } from './entities/state.dto';

@Injectable()
export class StateService {
  constructor(
    @InjectModel(State)
    private model: typeof State,
  ) {}

  async findAll() {
    return await this.model.findAll();
  }

  async findAllIncl() {
    return await this.model.findAll({ paranoid: false });
  }

  async findById(id: number) {
    return await this.model.findByPk(id);
  }

  async findByIdIncl(id: number) {
    return await this.model.findByPk(id, { paranoid: false });
  }

  async findOneParams({ ...dto }: StateDto) {
    return await this.model.findOne({ where: { ...dto } });
  }

  async findManyParams({ ...dto }: StateDto) {
    return await this.model.findAll({ where: { ...dto } });
  }

  async create(dto: CreateStateDto) {
    const record = this.model.build({ ...dto });
    return await record.save();
  }

  async update(id: number, dto: UpdateStateDto) {
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
