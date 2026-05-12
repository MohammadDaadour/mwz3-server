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
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './entities/post.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request } from 'express';
import { GetPostsDto } from './entities/post.dto';  

@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'su')
    createPost(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
        return this.postService.createPost(req.user['id'], createPostDto);
    }

    @Get()
    @Public()
    getAllPosts(@Query() query: GetPostsDto) {
        return this.postService.getAllPosts(query);
    }


    @Get(':id')
    @Public()
    getPostById(@Param('id', ParseIntPipe) postId: number) {
        return this.postService.getPostWithComments(postId);
    }

    @Get('user/:id')
    @Public()
    getUserPosts(
        @Param('id', ParseIntPipe) userId: number,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
    ) {
        return this.postService.getUserPosts(userId, page, limit);
    }

    @Patch(':id/update')
    updatePost(
        @Req() req: Request,
        @Param('id', ParseIntPipe) postId: number,
        @Body() updatePostDto: UpdatePostDto) {
        return this.postService.updatePost(
            req.user['id'],
            postId,
            updatePostDto);
    }

    @Delete(':id')
    deletePost(
        @Req() req: Request,
        @Param('id', ParseIntPipe) postId: number) {
        return this.postService.deletePost(req.user['id'], postId)
    }

    @Delete('guarded/:id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    deletePostAdmin(@Param('id', ParseIntPipe) postId: number) {
        return this.postService.deletePostAdmin(postId);
    }
}