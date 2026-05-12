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
import { CreateReplyDto, UpdateReplyDto } from './entities/reply.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request } from 'express';
import { ReplyService } from './replies.service';

@Controller('replies')
export class ReplyController {
    constructor(private readonly replyService: ReplyService) {}

    @Post('comment/:commentId')
        createReply(
            @Req() req: Request,
            @Param('commentId', ParseIntPipe) commentId: number,
            @Body() createReplyDto: CreateReplyDto
        ) {
            return this.replyService.createReply(
                req.user['id'],
                commentId,
                createReplyDto
            );
        }
    
        @Patch(':replyId')
        updateReply(
            @Req() req: Request,
            @Param('replyId', ParseIntPipe) replyId: number,
            @Body() updateReplyDto: UpdateReplyDto
        ) {
            return this.replyService.updateReply(
                req.user['id'],
                replyId,
                updateReplyDto
            );
        }
    
        @Delete(':replyId')
        deleteReply(
            @Req() req: Request,
            @Param('replyId', ParseIntPipe) replyId: number
        ) {
            return this.replyService.deleteReply(
                req.user['id'],
                replyId
            );
        }
    
        @Delete('admin/:replyId')
        @UseGuards(RolesGuard)
        @Roles('admin')
        deleteReplyAdmin(@Param('replyId', ParseIntPipe) replyId: number) {
            return this.replyService.deleteReplyAdmin(replyId);
        }
}