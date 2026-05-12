import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Ad } from 'src/ads/entities/ad.entity';

@Table({
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  level: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  parent: number;

  @Column({ type: DataType.STRING(30), allowNull: false })
  labelEn: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  labelAr: string;

  @Column({ type: DataType.STRING })
  icon: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  order: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  promote: boolean;

  @HasMany(() => Ad, 'categoryFK')
  ads: Ad[];
}
