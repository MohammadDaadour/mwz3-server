import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Area } from 'src/areas/entities/area.entity';
import { Sub } from 'src/subs/entities/sub.entity';

@Table({
  modelName: 'SubType',
  tableName: 'substypes',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
})
export class SubType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING(5), allowNull: false })
  type: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  duration: number;

  @Column({ type: DataType.DECIMAL(8, 2), defaultValue: 0 })
  value: number;

  @Column({ type: DataType.STRING(3), allowNull: false })
  currency: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  labelEn: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  labelAr: string;

  @Column({ type: DataType.TEXT })
  descEn: string;

  @Column({ type: DataType.TEXT })
  descAr: string;

  @Column({ type: DataType.BOOLEAN })
  active: boolean;

  @HasMany(() => Sub, 'subTypeFK')
  subs: Sub[];

  @BelongsTo(() => Area, 'areaFK')
  area: Area;
}
