import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Area } from './entities/area.entity';
import { AreaDto, CreateAreaDto, UpdateAreaDto } from './entities/area.dto';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AreasService {
  constructor(
    @InjectModel(Area)
    private model: typeof Area,
    private sql: Sequelize,
  ) {}

  async findAll() {
    return await this.model.findAll();
  }

  async findById(id: number) {
    return await this.model.findByPk(id);
  }

  async findOneParams({ ...dto }: AreaDto) {
    return await this.model.findOne({ where: { ...dto } });
  }

  async findMultiParams({ ...dto }: AreaDto) {
    return await this.model.findAll({ where: { ...dto } });
  }

  async create(dto: CreateAreaDto) {
    const record = this.model.build({ ...dto });
    const result = await record.save();
    await this.sql.query('REFRESH MATERIALIZED VIEW areas_view;');
    return result;
  }

  async update(id: number, dto: UpdateAreaDto) {
    const record = await this.model.findByPk(id);
    const modd = await record?.update({ ...dto });
    const result = await modd?.save();
    await this.sql.query('REFRESH MATERIALIZED VIEW areas_view;');
    return result;
  }

  async remove(id: number) {
    const result = await this.model.destroy({ where: { id } });
    await this.sql.query('REFRESH MATERIALIZED VIEW areas_view;');
    return result;
  }

  async areasView() {
    return await this.sql.query(`SELECT * FROM areas_view;`, {
      type: QueryTypes.SELECT,
    });
  }

  async areasViewSingle(id: number) {
    return await this.sql.query('SELECT * FROM areas_view WHERE id = $1;', {
      bind: [id],
      type: QueryTypes.SELECT,
    });
  }
}
