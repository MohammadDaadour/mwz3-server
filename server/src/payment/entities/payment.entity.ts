// src/payment/payment.model.ts
import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'payment_transactions', // Explicit table name
  timestamps: false, // Disable automatic timestamps (createdAt, updatedAt)
})
export class Payment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4, // Auto-generate UUIDs
  })
  id: string;

  @Column({
    type: DataType.DECIMAL(10, 2), // Numeric type with precision
    allowNull: false,
  })
  amount_cents: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  created_at: Date;

  @Column({
    type: DataType.STRING(10), // Currency code (e.g., "USD")
    allowNull: false,
  })
  currency: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  error_occured: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  has_parent_transaction: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  integration_id: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_3d_secure: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_auth: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_capture: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_refunded: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_standalone_payment: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_voided: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order_id: number;

  @Column({
    type: DataType.STRING(100), // Adjust length as needed
    allowNull: false,
  })
  owner: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  pending: boolean;

  @Column({
    type: DataType.STRING(50), // Adjust length as needed
    allowNull: false,
  })
  source_data_pan: string;

  @Column({
    type: DataType.STRING(50), // Adjust length as needed
    allowNull: false,
  })
  source_data_sub_type: string;

  @Column({
    type: DataType.STRING(50), // Adjust length as needed
    allowNull: false,
  })
  source_data_type: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  success: boolean;
}