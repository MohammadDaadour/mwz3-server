import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto, UpdateStateDto } from './entities/state.dto';

@Controller('state')
export class StateController {
  constructor(private readonly service: StateService) {}

  @Post()
  create(@Body() dto: CreateStateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStateDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
