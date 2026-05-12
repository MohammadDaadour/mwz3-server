import { forwardRef, Module } from "@nestjs/common";
import { BlogCommentController } from "./blogComments.controller";
import { BlogCommentService } from "./blogComments.service";
import { SequelizeModule } from '@nestjs/sequelize';
import { BlogComment } from "./entities/blogComment.entity";
import { UsersModule } from "src/users/users.module";
import { PostsModule } from "src/posts/posts.module";
import { Reply } from "src/replies/entities/reply.entity";
import { ReplyModule } from "../replies/replies.module";


@Module({
    controllers: [BlogCommentController],
    providers: [BlogCommentService],
    imports: [SequelizeModule.forFeature([BlogComment]), UsersModule, forwardRef(() => PostsModule), forwardRef(() => ReplyModule)],
    exports: [SequelizeModule, BlogCommentService]
})

export class BlogCommentModule { }