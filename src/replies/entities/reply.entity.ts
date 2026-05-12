import {
    Table,
    Model,
    Column,
    DataType,
    BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { BlogComment } from 'src/blogComments/entities/blogComment.entity';

@Table({
    modelName: 'Replies',
    tableName: 'replies',
    timestamps: true,
    paranoid: true,
})
export class Reply extends Model {
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

    @ForeignKey(() => BlogComment)
    @Column({ type: DataType.INTEGER })
    commentId: number;

    @BelongsTo(() => BlogComment, {
        foreignKey: 'commentId',
        onDelete: 'CASCADE',
    })
    comment: BlogComment;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;
}