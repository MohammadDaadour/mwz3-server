import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { Area } from 'src/areas/entities/area.entity';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { State } from 'src/state/entities/state.entity';
import { Comment } from 'src/comments/entities/comment.entity';

export enum BoostPlan {
  ONE_DAY = 'ONE_DAY',
  THREE_DAYS = 'THREE_DAYS',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

@Table({
  modelName: 'Ad',
  tableName: 'ads',
  timestamps: true,
  paranoid: true,
  indexes: [{ using: 'gin', fields: ['searchVector'] }],
})
export class Ad extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING(120), allowNull: false })
  label: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  value: number;

  @Column({ type: DataType.STRING(3), allowNull: false })
  currency: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.BIGINT })
  image: number;

  @Column({ type: DataType.JSONB })
  details: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  boosted: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  boost_request: boolean;

  // new
  @Column({
    type: DataType.ENUM(...Object.values(BoostPlan)),
    allowNull: true,
  })
  boost_plan: BoostPlan;

  @Column({ type: DataType.DATE, allowNull: true })
  boost_start: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  boost_end: Date;
  // new

  @Column({ type: DataType.TEXT })
  notes: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  visits: number;

  @Column({
    type: "TSVECTOR GENERATED ALWAYS AS (to_tsvector('arabic', COALESCE(label, '') || ' ' || COALESCE(description, ''))) STORED",
    set() {
      throw new Error('searchVector is read-only');
    },
  })
  searchVector: string;

  @Column({ type: DataType.DATE })
  activatedAt: Date;

  @BelongsTo(() => User, 'userFK')
  user: User;

  @BelongsTo(() => Category, 'categoryFK')
  category: Category;

  @BelongsTo(() => Area, 'areaFK')
  area: Area;

  @BelongsTo(() => State, 'stateFK')
  state: State;

  @HasMany(() => Comment, 'adFK')
  comments: Comment[];
}
