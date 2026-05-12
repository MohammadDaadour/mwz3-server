import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Ad } from 'src/ads/entities/ad.entity';
import { Area } from 'src/areas/entities/area.entity';
import { Sub } from 'src/subs/entities/sub.entity';

export class UserDto {
  readonly id?: number;
  email?: string;
  hash?: string;
  label?: string;
  image?: number;
  certified?: boolean;
  phone?: string;
  counter?: number;
  favs?: number[];
  type?: string;
  activatedAt?: Date;
  createdAt?: Date;
  deletedAt?: Date;
  area?: Area;
  ads?: Ad[];
  subs?: Sub[];
  facebook?: boolean;
  google?: boolean;
}

export class CreateUserDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'deletedAt',
  'ads',
  'subs',
]) {
  email: string;
  hash?: string;
  label: string;
  image?: number;
  phone?: string;
  type: string;
  area?: Area;
  areaFK?: number;
  activatedAt?: Date;
  facebook?: boolean;
  google?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  certified?: boolean;
  counter?: number;
  favs?: number[];
  activatedAt?: Date;
}
