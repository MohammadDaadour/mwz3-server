import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateCommentDto } from './entities/comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Public()
  @Get(':ad')
  async getAdComments(@Param('ad') ad: string) {
    return await this.service.getAdComments(+ad);
  }

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    return await this.service.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(+id);
  }
}
