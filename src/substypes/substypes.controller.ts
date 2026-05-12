import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SubstypesService } from './substypes.service';
import { CreateSubTypeDto, UpdateSubTypeDto } from './entities/subtype.dto';

@Controller('substypes')
export class SubstypesController {
  constructor(private readonly service: SubstypesService) {}

  @Get()
  async findAll() {
    return await this.service.findAllIncl();
  }

  @Get('filter/:user')
  async findFiltered(@Param('user') user: string) {
    return await this.service.findFiltered(+user)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubTypeDto) {
    await this.service.update(+id, dto);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    await this.service.restore(+id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(+id);
  }

  // @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() dto: CreateSubTypeDto) {
    await this.service.create(dto);
  }
}
