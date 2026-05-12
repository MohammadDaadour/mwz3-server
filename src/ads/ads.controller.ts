import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
  Patch
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './entities/ad.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ReqJwt } from 'src/auth/interfaces/reqUser.interface';
import { BoostPlan } from './entities/ad.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('ads')
@ApiTags('Ads')
export class AdsController {
  constructor(private readonly service: AdsService) { }

  @Get('boost-requests')
  @Roles('admin')
  async getBoostRequests(
    @Query('limit') limit: number = 15,
    @Query('page') page: number = 1,
  ) {
    return await this.service.getBoostRequests(+limit, +page);
  }


  @Public()
  @Get('filter')
  async findFiltered(
    @Query('lmt') limit?: string,
    @Query('a') area?: string,
    @Query('c') category?: string,
    @Query('q') query?: string,
    @Query('pg') page?: string,
    @Query('filter') filter?: string,
  ) {
    return await this.service.getFiltered(
      limit ? parseInt(limit, 10) : 10,
      page ? parseInt(page, 10) : 1,
      area ? parseInt(area, 10) : undefined,
      category ? parseInt(category, 10) : undefined,
      query,
      filter?.includes('bst') ? true : false,
      filter?.includes('crt') ? true : false,
    );
  }

  @Get('boosted')
  @Public()
  async getBoostedAds(
    @Query('limit') limit: number = 15,
    @Query('page') page: number = 1,
  ) {
    return this.service.getBoostedAds(+limit, +page);
  }

  @Get('admin')
  async findFilteredAdmin(
    @Query('pg') page: string,
    @Query('q') query: string,
    @Query('u') user: string,
  ) {
    return await this.service.findAllIncl(+page, query, user);
  }

  @Public()
  @Get(':id')
  async findOnePublic(@Param('id') id: string) {
    return await this.service.findOnePublic(+id);
  }

  @Get('admin/:id')
  async findOnedAdmin(@Param('id') id: string) {
    return await this.service.findByIdIncl(+id);
  }

  @Get('user/:id')
  async findOwned(@Param('id') userId: string, @Query('pg') page: string) {
    return await this.service.getOwned(+userId, +page);
  }

  @Public()
  @Get('user/:id/public')
  async findByUser(@Param('id') userId: string) {
    return await this.service.getByUser(+userId);
  }

  @Get('user/:id/favs')
  async findFavs(@Param('id') id: number) {
    return await this.service.getFavs(+id);
  }

  @Get('user/:id/:ad')
  async findOwnedSingle(
    @Param('id') userId: string,
    @Param('ad') adId: string,
  ) {
    return await this.service.findOnePrivate(+adId, +userId);
  }

  @Public()
  @Get('count/:ctg')
  async findCount(@Param('ctg') ctg: string) {
    return await this.service.getCount(+ctg);
  }

  @Post()
  async create(@Body() dto: CreateAdDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return await this.service.update(+id, dto);
  }

  @Put('admin/:id')
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return await this.service.updateIncl(+id, dto);
  }

  @Public()
  @Put('visits/:id')
  async incVisits(@Param('id') id: string) {
    await this.service.incVisits(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }

  @Get('supermarket')
  async getSupermarketProducts(
    @Query('limit') limit: number = 15,
    @Query('page') page: number = 1,
    @Query('area') area?: number,
    @Query('query') query?: string,
    @Query('boosted') boosted?: boolean,
    @Query('certified') certified?: boolean,
  ) {
    if (area) area = parseInt(area as any);
    if (boosted) boosted = (boosted as any) === 'true';
    if (certified) certified = (certified as any) === 'true';

    return this.service.getSupermarketProducts(
      limit,
      page,
      area,
      query,
      boosted,
      certified,
    );
  }

  @Post(':id/boost-request')
  async requestBoost(
    @Param('id') adId: string,
    @Body('plan') plan: BoostPlan,
    @Req() req: ReqJwt,
  ) {
    return await this.service.requestBoost(+adId, req.user.id, plan);
  }

  @Patch('admin/:id/approve-boost')
  @Roles('admin')
  async approveBoost(@Param('id') adId: string) {
    return await this.service.approveBoost(+adId);
  }

  @Patch('admin/:id/reject-boost')
  @Roles('admin')
  async rejectBoost(@Param('id') adId: string) {
    return await this.service.rejectBoost(+adId);
  }


}
