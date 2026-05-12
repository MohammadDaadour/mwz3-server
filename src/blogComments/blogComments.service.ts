
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogComment } from './entities/blogComment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from './entities/blogComment.dto';

@Injectable()
export class BlogCommentService {
    constructor(
        @InjectModel(BlogComment) private model: typeof BlogComment,
        @InjectModel(Post) private postModel: typeof Post,
        @InjectModel(User) private userModel: typeof User,
        private sql: Sequelize,
    ) { }

    async createBlogComment(userId: number, postId: number, createBlogCommentDto: CreateBlogCommentDto) {
        return await this.sql.transaction(async (t) => {
            const user = await this.userModel.findByPk(userId, { transaction: t });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const post = await this.postModel.findByPk(postId, { transaction: t });
            if (!post) {
                throw new NotFoundException('Post not found');
            }

            const blogComment = await this.model.create({
                userId,
                postId,
                content: createBlogCommentDto.content,
                parentId: createBlogCommentDto.parentId || null
            }, { transaction: t });

            return blogComment;
        });
    }

    async getPostComments(postId: number, page: number = 1, limit: number = 20) {
        const post = await this.postModel.findByPk(postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return await this.model.findAndCountAll({
            where: { postId },
            include: [
                { model: User, attributes: ['id', 'username'] },
                { model: Post, attributes: ['id', 'title'] }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
    }

    async updateBlogComment(userId: number, commentId: number, updateBlogCommentDto: UpdateBlogCommentDto) {
        const comment = await this.model.findOne({
            where: { id: commentId, userId }
        });

        if (!comment) {
            throw new NotFoundException("Comment not found or access denied");
        }

        comment.content = updateBlogCommentDto.content;
        await comment.save();

        return comment;
    }

    async deleteBlogComment(userId: number, commentId: number) {
        const comment = await this.model.findOne({
            where: { id: commentId, userId }
        });

        if (!comment) {
            throw new NotFoundException("Comment not found or access denied");
        }

        return await comment.destroy();
    }

    async deleteBlogCommentAdmin(commentId: number) {
        const comment = await this.model.findByPk(commentId);
        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        return await comment.destroy();
    }
}