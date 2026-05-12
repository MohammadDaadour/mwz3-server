import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './entities/area.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('areas')
export class AreasController {
  constructor(private readonly service: AreasService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Public()
  @Get('view')
  async getView() {
    return await this.service.areasView();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findById(+id);
  }

  @Public()
  @Get(':id/view')
  async getViewSingle(@Param('id') id: string) {
    return await this.service.areasViewSingle(+id);
  }

  @Post()
  async create(@Body() dto: CreateAreaDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return await this.service.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
