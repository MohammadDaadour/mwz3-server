import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateRatingDto } from './entities/rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly service: RatingsService) {}

  @Public()
  @Get('ad/:id')
  async getAdRating(@Param('id') id: string) {
    return await this.service.getRating('ad', +id);
  }

  @Public()
  @Get('user/:id')
  async getUserRating(@Param('id') id: string) {
    return await this.service.getRating('user', +id);
  }

  @Put()
  async setRating(@Body() dto: CreateRatingDto) {
    return await this.service.setRating(dto);
  }
}
