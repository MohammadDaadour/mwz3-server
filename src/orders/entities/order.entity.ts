import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { subOrder } from './sub-order.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
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

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: DataType.STRING })
  first_name: string;

  @Column({ type: DataType.STRING })
  last_name: string;

  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  phone_number: string;

  @Column({ type: DataType.STRING })
  street: string;

  @Column({ type: DataType.STRING })
  building: string;

  @Column({ type: DataType.STRING })
  floor: string;

  @Column({ type: DataType.STRING })
  apartment: string;

  @Column({ type: DataType.STRING })
  city: string;

  @Column({ type: DataType.STRING })
  state: string;

  @Column({ type: DataType.STRING })
  country: string;

  @Column({ type: DataType.STRING, allowNull: true })
  postal_code: string;

  @Column({ type: DataType.STRING })
  payment_method: string;


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

  @HasMany(() => subOrder)
  subOrders: subOrder[];
}