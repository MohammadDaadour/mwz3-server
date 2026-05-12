import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { SubType } from 'src/substypes/entities/subtype.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  modelName: 'Sub',
  tableName: 'subs',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
})
export class Sub extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
  active: boolean;

  @Column({ type: DataType.DATE })
  activatedAt: Date;

  @Column({ type: DataType.DATE })
  endsAt: Date;

  @BelongsTo(() => User, 'userFK')
  user: User;

  @BelongsTo(() => SubType, 'subTypeFK')
  subType: SubType;
}
