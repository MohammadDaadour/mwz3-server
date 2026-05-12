import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';

export class AreaDto {
  readonly id?: number;
  level?: number;
  parent?: number;
  labelEn?: string;
  labelAr?: string;
  ads?: Ad[];
  users?: User[];
}

export class CreateAreaDto extends OmitType(AreaDto, ['id', 'ads', 'users']) {
  level: number;
  parent: number;
  labelEn: string;
  labelAr: string;
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
