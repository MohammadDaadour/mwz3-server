import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Order } from './order.entity';
import { subOrder } from './sub-order.entity';
import { Ad } from '../../ads/entities/ad.entity';

@Table
export class OrderItem extends Model { 
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  orderId: number; 

  @BelongsTo(() => Order)
  order: Order;

  @ForeignKey(() => subOrder)
  @Column({ type: DataType.INTEGER })
  subOrderId: number;

  @BelongsTo(() => subOrder) 
  subOrder: subOrder;

  @ForeignKey(() => Ad)
  @Column({ type: DataType.INTEGER })
  productId: number;

  @BelongsTo(() => Ad)
  product: Ad;

  @Column({ type: DataType.INTEGER })
  quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2) })
  price: number;
}