import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Ad } from 'src/ads/entities/ad.entity';

export class CategoryDto {
  readonly id?: number;
  level?: number;
  parent?: number;
  labelEn?: string;
  labelAr?: string;
  icon?: string;
  order?: number;
  promote?: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  ads?: Ad[];
}

export class CreateCategoryDto extends OmitType(CategoryDto, [
  'id',
  'createdAt',
  'deletedAt',
  'ads',
]) {
  level: number;
  parent: number;
  labelEn: string;
  labelAr: string;
  icon?: string;
  order?: number;
  promote?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
