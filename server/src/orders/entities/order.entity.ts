import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

@Table
export class Order extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  vendorId: number;

  @BelongsTo(() => User, 'vendorId')
  vendor: User;

  @Column({ type: DataType.STRING })
  shippingAddress: string;

  @Column({ type: DataType.STRING })
  phoneNumber: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ 
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: DataType.DECIMAL(10, 2) })
  totalAmount: number;

  @HasMany(() => OrderItem)
  items: OrderItem[];
}