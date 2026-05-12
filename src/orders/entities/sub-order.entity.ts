import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

export enum subOrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Table
export class subOrder extends Model {
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
    id: number;

    @ForeignKey(() => Order)
    @Column({ type: DataType.INTEGER })
    orderId: number;

    @BelongsTo(() => Order, 'orderId')
    order: Order;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    vendorId: number;

    @BelongsTo(() => User, 'vendorId')
    vendor: User;

    @Column({
        type: DataType.ENUM(...Object.values(subOrderStatus)),
        defaultValue: subOrderStatus.PENDING
    })
    status: subOrderStatus;

    @HasMany(() => OrderItem)
    items: OrderItem[];
}