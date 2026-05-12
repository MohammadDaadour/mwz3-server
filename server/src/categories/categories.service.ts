import { Injectable } from '@nestjs/common';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './entities/category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private model: typeof Category,
    private sql: Sequelize,
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

  async findOneParams({ ...dto }: CategoryDto) {
    return await this.model.findOne({ where: { ...dto } });
  }

  async create(dto: CreateCategoryDto) {
    const record = this.model.build({ ...dto });
    const result = await record.save();
    await this.sql.query(
      'REFRESH MATERIALIZED VIEW categories_view;',
    );
    return result;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const record = await this.model.findByPk(id);
    const modd = await record?.update({ ...dto });
    const result = await modd?.save();
    await this.sql.query(
      'REFRESH MATERIALIZED VIEW categories_view;',
    );
    return result;
  }

  async remove(id: number) {
    const result = await this.model.destroy({ where: { id } });
    await this.sql.query(
      'REFRESH MATERIALIZED VIEW categories_view;',
    );
    return result;
  }

  async restore(id: number) {
    const result = await this.model.restore({ where: { id } });
    await this.sql.query(
      'REFRESH MATERIALIZED VIEW categories_view;',
    );
    return result;
  }

  async categoriesView() {
    return await this.sql.query(`SELECT * FROM categories_view;`, {
      type: QueryTypes.SELECT,
    });
  }

  async categoriesViewSingle(id: number) {
    return await this.sql.query(
      'SELECT * FROM categories_view WHERE id = $1;',
      {
        bind: [id],
        type: QueryTypes.SELECT,
      },
    );
  }

  async getPromoted() {
    return await this.model.findAll({ where: { promote: true } });
  }
}
