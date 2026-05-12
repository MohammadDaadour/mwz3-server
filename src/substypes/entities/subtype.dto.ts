import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Area } from 'src/areas/entities/area.entity';
import { Sub } from 'src/subs/entities/sub.entity';

export class SubTypeDto {
  readonly id?: number;
  type?: string;
  duration?: number;
  value?: number;
  currency?: string;
  labelEn?: string;
  labelAr?: string;
  descEn?: string;
  descAr?: string;
  active?: boolean;
  createdAt?: Date;
  daletedAt?: Date;
  subs?: Sub[];
  area?: Area;
  areaFK?: number;
}

export class CreateSubTypeDto extends OmitType(SubTypeDto, [
  'id',
  'createdAt',
  'daletedAt',
  'subs',
]) {
  type: string;
  duration: number;
  value: number;
  currency: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  active: boolean;
  area?: Area;
  areaFK: number;
}

export class UpdateSubTypeDto extends PartialType(CreateSubTypeDto) {}
