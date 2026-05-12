import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto, UpdateMessageDto } from './entities/messages.dto';

@Controller('messages')
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get(':id')
  async findThreads(@Param('id') id: string) {
    return await this.service.findThreads(+id);
  }

  @Get('notif/:id')
  async findNotifications(@Param('id') id: string) {
    return await this.service.findNotifications(+id)
  }

  @Get('notif/:id/threads')
  async findNewThreads(@Param('id') id: string) {
    return await this.service.findNewThreads(+id)
  }

  @Get(':id/:prt')
  async findMessages(@Param('id') id: string, @Param('prt') prt: string) {
    return await this.service.findMessages(+id, +prt);
  }

  @Post()
  async sendMessage(@Body() dto: CreateMessageDto) {
    await this.service.sendMessage(dto);
  }

  @Put()
  async markRead(@Body() dto: UpdateMessageDto) {
    await this.service.markRead(dto.tx, dto.rx);
  }
}
