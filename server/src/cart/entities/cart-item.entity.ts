import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Cart } from './cart.entity';
import { Ad } from '../../ads/entities/ad.entity';

@Table({
  tableName: 'cart_items',
  timestamps: false
}) // Explicitly define the table name
export class CartItem extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER
  })
  id: number;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.INTEGER,
    field: 'cart_id' // Map to the "cart_id" column in the database
  })
  cartId: number;

  @ForeignKey(() => Ad)
  @Column({
    type: DataType.INTEGER,
    field: 'ad_id' // Map to the "ad_id" column in the database
  })
  adId: number; // Rename to match TypeScript conventions

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  price: number;

  @BelongsTo(() => Cart)
  cart: Cart;

  @BelongsTo(() => Ad)
  ad: Ad;
}