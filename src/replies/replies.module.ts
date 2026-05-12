import { forwardRef, Module } from "@nestjs/common";
import { ReplyController } from "./replies.controller";
import { ReplyService } from "./replies.service";
import { SequelizeModule } from '@nestjs/sequelize';
import { Reply } from "./entities/reply.entity";
import { UsersModule } from "src/users/users.module";
import { BlogCommentModule } from "src/blogComments/blogComments.module";

@Module({
    controllers: [ReplyController],
    providers: [ReplyService],
    imports: [SequelizeModule.forFeature([Reply]), UsersModule, forwardRef(() => BlogCommentModule)],
    exports: [SequelizeModule, ReplyService]
})

export class ReplyModule {}