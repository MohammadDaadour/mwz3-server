import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Table({
  tableName: 'carts', // Explicit lowercase table name
  timestamps: false,   // Enable if your table has created_at/updated_at
  // createdAt: 'created_at', // Map to the database column
  // updatedAt: 'updated_at' 
})
export class Cart extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => User)
  @Column({ 
    type: DataType.INTEGER,
    field: 'user_id' // Map to "user_id" database column
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => CartItem)
  items: CartItem[];
}
