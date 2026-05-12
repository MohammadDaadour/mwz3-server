import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './entities/category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('promoted')
  findPromoted() {
    return this.service.getPromoted();
  }

  @Public()
  @Get('view')
  getView() {
    return this.service.categoriesView();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(+id);
  }

  @Public()
  @Get(':id/view')
  getViewSingle(@Param('id') id: string) {
    return this.service.categoriesViewSingle(+id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
