import {
    Table,
    Model,
    Column,
    DataType,
    BelongsTo,
    HasMany,
    AllowNull,
    ForeignKey
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { BlogComment } from 'src/blogComments/entities/blogComment.entity';

@Table({
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
    paranoid: true,
    //   indexes: [{ using: 'gin', fields: ['searchVector'] }],
})
export class Post extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    })
    id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    userId: number;

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
    })
    user: User;

    @Column({ type: DataType.STRING(120), allowNull: false })
    title: string;

    @Column({ type: DataType.BIGINT, allowNull: true })
    image: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    views: number;

    @HasMany(() => BlogComment)
    comments: BlogComment[];
}