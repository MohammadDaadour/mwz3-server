import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  HttpException,
  InternalServerErrorException,
  Res,
  BadRequestException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './entities/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly service: UsersService) { }

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
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    try {
      return await this.service.update(+id, dto);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
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
  @UseGuards(RolesGuard)
  @Roles('admin', 'su')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
