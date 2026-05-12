import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
  paranoid: false,
})
export class Message extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.TEXT })
  value: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  read: boolean;

  @BelongsTo(() => User, 'tx')
  sender: User;

  @BelongsTo(() => User, 'rx')
  receiver: User;
}
