import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'chat_messages',
  timestamps: false, 
})
export class ChatMessage extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  senderUserId: number | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  receiverUserId: number | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  message: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isRead: boolean;

  @CreatedAt
  @Column({ type: DataType.DATE })
  sentAt: Date;

  @BelongsTo(() => User, 'senderUserId')
  senderUser: User;

  @BelongsTo(() => User, 'receiverUserId')
  receiverUser: User;
}