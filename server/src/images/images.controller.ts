import {
  Get,
  Post,
  StreamableFile,
  UseInterceptors,
  Param,
  Res,
  Delete,
  NotFoundException,
  UploadedFile,
  HttpStatus,
  HttpCode,
  UploadedFiles,
  Put,
  Query,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import * as sharp from 'sharp';

@Controller('images')
@ApiTags('Images')
export class ImagesController {
  constructor(private readonly service: ImagesService) {}

  @Public()
  @Get(':scope/:ref/meta')
  async getImagesMeta(
    @Param('scope') scope: string,
    @Param('ref') ref: string,
  ) {
    const res = await this.service.findManyParams({ scope: scope, ref: ref });
    return res;
  }

  @Public()
  @Get(':scope/:ref/:id')
  async getImage(
    @Param('scope') scope: string,
    @Param('ref') ref: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // check id type
    if (isNaN(parseInt(id, 10))) {
      throw new NotFoundException();
    }
    // check file exists
    const file = await this.service.findOneParams({
      id: +id,
      scope: scope,
      ref: ref,
    });

    if (!file) {
      throw new NotFoundException();
    }
    // return file
    const stream = createReadStream(
      resolve(process.cwd(), 'uploads', scope, id),
    );
    res.set({ 'Content-Type': file.mime });
    return new StreamableFile(stream);
  }

  @HttpCode(HttpStatus.OK)
  @Post('banners/:ref')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadBannerImage(
    @Param('ref') ref: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileName =
      new Date().toISOString().slice(2, -5).replace(/\D/g, '') +
      Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, '0');

    await sharp(file.buffer).toFile(
      resolve(process.cwd(), 'uploads', 'banners') + `/${fileName}`,
    );

    await this.service.createImage({
      id: +fileName,
      scope: 'banners',
      ref: ref,
      mime: file.mimetype,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('users/:ref')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadUserImage(
    @Param('ref') ref: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileName =
      new Date().toISOString().slice(2, -5).replace(/\D/g, '') +
      Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, '0');

    await sharp(file.buffer)
      .resize(250, 250, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(resolve(process.cwd(), 'uploads', 'users') + `/${fileName}`);

    await this.service.createUserImage({
      id: +fileName,
      scope: 'users',
      ref: ref,
      mime: 'image/png',
    });

    // new

    return { 
      success: true,
      imageId: fileName,
      imageUrl: `/images/users/${fileName}`
    };
    // new
  }

  @HttpCode(HttpStatus.OK)
  @Post('ads/:ref')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
    }),
  )
  async updloadAdImages(
    @Param('ref') ref: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('cover') cover?: string,
  ) {
    const rand = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');

    files.forEach((file, index) => {
      const fileName =
        new Date().toISOString().slice(2, -5).replace(/\D/g, '') + index + rand;

      sharp(file.buffer)
        .resize(1200, 600, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(resolve(process.cwd(), 'uploads', 'ads') + `/${fileName}`);

      if (index === 0 && !cover) {
        this.service.setAdCover(+ref, +fileName);
      }

      this.service.createImage({
        id: +fileName,
        scope: 'ads',
        ref: ref,
        mime: 'image/png',
      });
    });
  }

  @Put('ads/:ref/:id')
  async updateAdCover(@Param('ref') ref: string, @Param('id') id: string) {
    await this.service.setAdCover(+ref, +id);
  }

  @Delete('single/:id')
  async removeImage(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
