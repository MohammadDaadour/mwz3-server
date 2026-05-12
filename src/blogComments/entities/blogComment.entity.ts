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
import { Post } from 'src/posts/entities/post.entity';
import { Reply } from 'src/replies/entities/reply.entity';

@Table({
    modelName: 'BlogComment',
    tableName: 'blogComments',
    timestamps: true,
    paranoid: true,
})
export class BlogComment extends Model {
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

    @ForeignKey(() => Post)
    @Column({ type: DataType.INTEGER })
    postId: number;

    @BelongsTo(() => Post, {
        foreignKey: 'postId',
        onDelete: 'CASCADE',
    })
    post: Post;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @ForeignKey(() => BlogComment)
    @Column({ allowNull: true })
    parentId: number;

    @BelongsTo(() => BlogComment, { foreignKey: 'parentId', as: 'parent' })
    parent: BlogComment;

    @HasMany(() => BlogComment, { foreignKey: 'parentId', as: 'replies' })
    replies: BlogComment[];

}