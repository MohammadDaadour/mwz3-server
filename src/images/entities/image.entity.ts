import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
  modelName: 'Image',
  tableName: 'images',
  timestamps: false,
})
export class Image extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  scope: string;

  @Column({ type: DataType.STRING })
  ref: string;

  @Column({ type: DataType.STRING })
  mime: string;
}
