import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SubsService } from './subs.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubDto, UpdateSubDto } from './entities/sub.dto';

@Controller('subs')
@ApiTags('Subs')
export class SubsController {
  constructor(private readonly service: SubsService) {}

  @Get()
  async findAll(@Query('pg') page: string, @Query('q') query: string) {
    return await this.service.findAllIncl(+page, query);
  }

  @Get(':id')
  async findByUser(@Param('id') user: string) {
    return await this.service.findByUser(+user);
  }

  @Post()
  async create(@Body() dto: CreateSubDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubDto) {
    return await this.service.update(+id, dto);
  }
}
