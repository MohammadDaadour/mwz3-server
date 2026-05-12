import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { Ad } from 'src/ads/entities/ad.entity';
import { Area } from 'src/areas/entities/area.entity';
import { Sub } from 'src/subs/entities/sub.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { Message } from 'src/messages/entities/messages.entity';

@Table({
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['phone'] },
  ],
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING(50) })
  email: string;

  @Column({ type: DataType.TEXT })
  hash: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  label: string;

  @Column({ type: DataType.BIGINT })
  image: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  certified: string;

  @Column({ type: DataType.STRING(20) })
  phone: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  counter: number;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  favs: number[];

  @Column({ type: DataType.STRING(5), allowNull: false })
  type: string;

  @Column({ type: DataType.DATE })
  activatedAt: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  facebook: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  google: boolean;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  balance: number;

  @BelongsTo(() => Area, 'areaFK')
  area: Area;

  @HasMany(() => Ad, 'userFK')
  ads: Ad[];

  @HasMany(() => Sub, 'userFK')
  subs: Sub[];

  @HasMany(() => Comment, 'userFK')
  comments: Comment[];

  @HasMany(() => Rating, 'userFK')
  ratings: Rating[];

  @HasMany(() => Message, 'tx')
  sent: Message[];

  @HasMany(() => Message, 'rx')
  received: Message[];
}
