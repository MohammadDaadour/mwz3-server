
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Reply } from './entities/reply.entity';
import { BlogComment } from 'src/blogComments/entities/blogComment.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateReplyDto, UpdateReplyDto } from './entities/reply.dto';

@Injectable()
export class ReplyService {
    constructor(
        @InjectModel(BlogComment) private Commentmodel: typeof BlogComment,
        @InjectModel(Reply) private replyModel: typeof Reply,
        @InjectModel(User) private userModel: typeof User,
        private sql: Sequelize,
    ) { }

    async createReply(userId: number, commentId: number, createReplyDto: CreateReplyDto) {
        return await this.sql.transaction(async (t) => {
            const user = await this.userModel.findByPk(userId, { transaction: t });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const comment = await this.Commentmodel.findByPk(commentId, { transaction: t });
            if (!comment) {
                throw new NotFoundException('Post not found');
            }

            const reply = await this.replyModel.create({
                userId,
                commentId,
                content: createReplyDto.content,
            }, { transaction: t });

            return reply;
        });
    }

    // async getPostComments(postId: number, page: number = 1, limit: number = 20) {
    //     const post = await this.postModel.findByPk(postId);
    //     if (!post) {
    //         throw new NotFoundException('Post not found');
    //     }

    //     return await this.model.findAndCountAll({
    //         where: { postId },
    //         include: [
    //             { model: User, attributes: ['id', 'username'] },
    //             { model: Post, attributes: ['id', 'title'] }
    //         ],
    //         limit,
    //         offset: (page - 1) * limit,
    //         order: [['createdAt', 'DESC']]
    //     });
    // }

    async updateReply(userId: number, ReplyId: number, updateReplyDto: UpdateReplyDto) {
        const reply = await this.replyModel.findOne({
            where: { id: ReplyId, userId }
        });

        if (!reply) {
            throw new NotFoundException("Comment not found or access denied");
        }

        reply.content = updateReplyDto.content;
        await reply.save();

        return reply;
    }

    async deleteReply(userId: number, replyId: number) {
        const reply = await this.replyModel.findOne({
            where: { id: replyId, userId }
        });

        if (!reply) {
            throw new NotFoundException("Comment not found or access denied");
        }

        return await reply.destroy();
    }

    async deleteReplyAdmin(replyId: number) {
        const reply = await this.replyModel.findByPk(replyId);
        if (!reply) {
            throw new NotFoundException("Comment not found");
        }

        return await reply.destroy();
    }
}
