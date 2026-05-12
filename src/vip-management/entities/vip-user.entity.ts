import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { Request } from '../../request/entities/request.entity';

@Table({
  modelName: 'Vip_user',
  tableName: 'vip_users',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
})
export class VipUser extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: DataType.TEXT })
  password: string;

  @Column({ type: DataType.DECIMAL, defaultValue: 0 })
  credit: number;

  @HasMany(() => Request)
  requests: Request[];
}