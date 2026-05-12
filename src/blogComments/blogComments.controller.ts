import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    Req,
    Patch,
    ParseIntPipe,
} from '@nestjs/common';
import { BlogCommentService } from './blogComments.service';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from './entities/blogComment.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request } from 'express';

@Controller('blogcomments')
export class BlogCommentController {
    constructor(private readonly blogCommentService: BlogCommentService) {}

    @Post('post/:postId')
    createBlogComment(
        @Req() req: Request,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() createBlogCommentDto: CreateBlogCommentDto
    ) {
        return this.blogCommentService.createBlogComment(
            req.user['id'],
            postId,
            createBlogCommentDto
        );
    }

    @Get('post/:postId')
    @Public()
    getPostComments(
        @Param('postId', ParseIntPipe) postId: number,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20
    ) {
        return this.blogCommentService.getPostComments(postId, page, limit);
    }

    @Patch(':commentId')
    updateBlogComment(
        @Req() req: Request,
        @Param('commentId', ParseIntPipe) commentId: number,
        @Body() updateBlogCommentDto: UpdateBlogCommentDto
    ) {
        return this.blogCommentService.updateBlogComment(
            req.user['id'],
            commentId,
            updateBlogCommentDto
        );
    }

    @Delete(':commentId')
    deleteBlogComment(
        @Req() req: Request,
        @Param('commentId', ParseIntPipe) commentId: number
    ) {
        return this.blogCommentService.deleteBlogComment(
            req.user['id'],
            commentId
        );
    }

    @Delete('admin/:commentId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'su')
    deleteBlogCommentAdmin(@Param('commentId', ParseIntPipe) commentId: number) {
        return this.blogCommentService.deleteBlogCommentAdmin(commentId);
    }
}