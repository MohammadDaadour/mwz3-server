import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, Default } from 'sequelize-typescript';

@Table({
  tableName: 'analytics',
  timestamps: true
})
export class Analytics extends Model<Analytics> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  ip: string;

  @Column(DataType.STRING)
  userAgent: string;

  @Column(DataType.STRING)
  page: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  visitedAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sessionId: string;
}
