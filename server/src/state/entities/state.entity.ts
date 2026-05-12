import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Ad } from 'src/ads/entities/ad.entity';

@Table({
  modelName: 'State',
  tableName: 'states',
  timestamps: false,
})
export class State extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  labelEn: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  labelAr: string;

  @HasMany(() => Ad, 'stateFK')
  ads: Ad[];
}
