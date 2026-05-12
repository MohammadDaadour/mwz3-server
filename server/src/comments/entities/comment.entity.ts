import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  modelName: 'Comment',
  tableName: 'comments',
  timestamps: true,
  deletedAt: false,
  updatedAt: false,
})
export class Comment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.TEXT })
  value: string;

  @BelongsTo(() => Ad, 'adFK')
  ad: Ad;

  @BelongsTo(() => User, 'userFK')
  user: User;
}
