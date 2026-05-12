import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  modelName: 'Area',
  tableName: 'areas',
  timestamps: false,
})
export class Area extends Model {
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

  @Column({ type: DataType.STRING(50), allowNull: false })
  labelEn: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  labelAr: string;

  @HasMany(() => Ad, 'areaFK')
  ads: Ad[];

  @HasMany(() => User, 'areaFK')
  users: User[];
}
