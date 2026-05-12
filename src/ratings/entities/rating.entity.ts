import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({
  modelName: 'Rating',
  tableName: 'ratings',
  timestamps: false,
})
export class Rating extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  type: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  ref: number;

  @Column({ type: DataType.INTEGER })
  value: number;

  @BelongsTo(() => User, 'userFK')
  user: User;
}
