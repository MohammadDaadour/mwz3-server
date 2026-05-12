import { Body, Controller, Get, Param, Put, BadRequestException } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateRatingDto } from './entities/rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly service: RatingsService) { }

  @Public()
  @Get('ad/:id')
  async getAdRating(@Param('id') id: string) {
    // return await this.service.getRating('ad', +id);
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid ad ID');
    }
    return await this.service.getRating('ad', parsedId);
  }

  @Public()
  @Get('user/:id')
  async getUserRating(@Param('id') id: string) {
    // return await this.service.getRating('user', +id);
    const parsedId = Number(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }
    return await this.service.getRating('user', parsedId);
  }

  @Put()
  async setRating(@Body() dto: CreateRatingDto) {
    return await this.service.setRating(dto);
  }
}
