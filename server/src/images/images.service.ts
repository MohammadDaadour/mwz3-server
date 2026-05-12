import { Injectable } from '@nestjs/common';
import { Image } from './entities/image.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreateImageDto, ImageDto } from './entities/image.dto';
import { UsersService } from 'src/users/users.service';
import { rm } from 'fs/promises';
import { resolve } from 'path';
import { AdsService } from 'src/ads/ads.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image)
    private model: typeof Image,
    private usersService: UsersService,
    private adsService: AdsService,
  ) {}

  async findOneParams({ ...dto }: ImageDto) {
    return await this.model.findOne({ where: { ...dto } });
  }

  async findManyParams({ ...dto }: ImageDto) {
    return await this.model.findAll({ where: { ...dto } });
  }

  async createImage(dto: CreateImageDto) {
    const record = this.model.build({ ...dto });
    await record.save();
  }

  async createUserImage(dto: CreateImageDto) {
    const oldPhoto = await this.model.findOne({
      where: { scope: 'users', ref: dto.ref },
    });
    if (oldPhoto) {
      try {
        await rm(
          resolve(process.cwd(), 'uploads', 'users', oldPhoto.id.toString()),
        );
        await oldPhoto.destroy();
      } catch {
        console.log('file not found');
      }
    }
    const record = this.model.build({ ...dto });
    await record.save();
    const user = await this.usersService.findById(parseInt(dto.ref, 10));
    await user.update({ image: dto.id });
  }

  async setAdCover(id: number, image: number) {
    await this.adsService.update(id, { image: image });
  }

  async remove(id: number) {
    const record = await this.model.findByPk(id);
    if (record.scope === 'users') {
      await this.usersService.update(parseInt(record.ref, 10), { image: null });
    } else if (record.scope === 'ads') {
      const ad = await this.adsService.findById(+record.ref);
      if (ad.image === record.id) {
        await ad.update(+record.ref, { image: null });
      }
    }
    try {
      await rm(
        resolve(process.cwd(), 'uploads', record.scope, record.id.toString()),
      );
    } catch {
      console.log('file not found');
    }
    await record.destroy();
  }
}
