import { forwardRef, Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from "./entities/post.entity";
import { UsersModule } from "src/users/users.module";
import { BlogCommentModule } from "src/blogComments/blogComments.module";


@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [SequelizeModule.forFeature([Post]), UsersModule, forwardRef(() => BlogCommentModule)],
  exports: [SequelizeModule, PostsService],
})
export class PostsModule {}