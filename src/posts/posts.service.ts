import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreatePostDto, UpdatePostDto } from './entities/post.dto';
import { BlogComment } from 'src/blogComments/entities/blogComment.entity';
import { Model, Op } from 'sequelize';
import { GetPostsDto } from './entities/post.dto';
import { Reply } from 'src/replies/entities/reply.entity';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post) private postModel: typeof Post,
        @InjectModel(User) private userModel: typeof User,
        @InjectModel(BlogComment) private blogModel: typeof BlogComment,
        private sql: Sequelize,
    ) { }

    async findById(postId: number) {
        const post = await this.postModel.findByPk(postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }


    async createPost(userId: number, createPostDto: CreatePostDto) {
        return await this.sql.transaction(async (t) => {
            const user = await this.userModel.findByPk(userId, { transaction: t });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const post = await this.postModel.create({
                userId: userId,
                title: createPostDto.title,
                content: createPostDto.content,
            }, { transaction: t });

            return post;
        });
    }

    async getAllPosts(query: GetPostsDto) {
        const { page = 1, limit = 10, search } = query;
        const whereClause: any = {};

        if (search) {
            whereClause.title = {
                [Op.iLike]: `%${search}%`
            };
        }

        return await this.postModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'label', 'image']
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
    }

    async getPostById(postId: number) {
        return await this.postModel.findByPk(postId);
    }

    async getPostWithComments(postId: number) {
        const post = await this.postModel.findByPk(postId, {
            include: [
                {
                    model: User, // 🔥 This includes the post owner
                    attributes: ['id', 'label', 'image', 'type'],
                },
                {
                    model: BlogComment,
                    where: { parentId: null }, // top-level comments فقط
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'label', 'image', 'type'],
                        },
                        {
                            model: BlogComment,
                            as: 'replies',
                            include: [
                                {
                                    model: User,
                                    attributes: ['id', 'label', 'image', 'type'],
                                },
                            ],
                            order: [['createdAt', 'DESC']]
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    async getUserPosts(userId: number, page: number = 1, limit: number = 10) {
        return await this.postModel.findAndCountAll({
            where: { userId },
            include: [{ model: User, attributes: ['id', 'label'] }],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
    }

    async updatePost(
        userId: number,
        postId: number,
        updatePostDto: UpdatePostDto,
    ) {
        const post = await this.postModel.findOne({ where: { id: postId, userId } });
        if (!post) {
            throw new NotFoundException("Post not found.")
        }

        if (updatePostDto.title !== undefined) post.title = updatePostDto.title;
        if (updatePostDto.content !== undefined) post.content = updatePostDto.content;

        await post.save();
        return post
    }

    async deletePost(userId: number, postId: number) {
        const post = await this.postModel.findOne({ where: { userId, id: postId } });
        if (!post) {
            throw new NotFoundException("Post not found.")
        }

        return await post.destroy();
    }

    async deletePostAdmin(postId: number) {
        const post = await this.postModel.findByPk(postId);
        if (!post) {
            throw new NotFoundException("Post not found.")
        }

        return await post.destroy();
    }
}