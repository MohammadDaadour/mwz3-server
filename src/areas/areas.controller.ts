import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  BadRequestException
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './entities/area.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('areas')
export class AreasController {
  constructor(private readonly service: AreasService) { }

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
    // return await this.service.findById(+id);
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid area ID');
    }
    return await this.service.findById(parsedId);
  }

  @Public()
  @Get(':id/view')
  async getViewSingle(@Param('id') id: string) {
    // return await this.service.areasViewSingle(+id);
    const parsedId = Number(id);
    if (!id || isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid or missing area ID');
    }
    return await this.service.areasViewSingle(parsedId);
  }

  @Post()
  async create(@Body() dto: CreateAreaDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    // return await this.service.update(+id, dto);
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid area ID');
    }
    return await this.service.update(parsedId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // return await this.service.remove(+id);
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid area ID');
    }
    return await this.service.remove(parsedId);
  }
}
