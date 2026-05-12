import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './entities/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('pg') page: string, @Query('role') role: string, @Query('q') query: string) {
    return this.service.findAllIncl(+page, role, query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(+id, dto);
  }

  @Put(':id/add')
  appendFav(@Param('id') id: string, @Body() { fav }: { fav: number }) {
    return this.service.insertFavs(+id, fav);
  }

  @Put(':id/remove')
  removeFave(@Param('id') id: string, @Body() { fav }: { fav: number }) {
    return this.service.removeFavs(+id, fav);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
