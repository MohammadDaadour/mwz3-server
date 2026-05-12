import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Ad } from 'src/ads/entities/ad.entity';

export class StateDto {
  readonly id?: number;
  labelEn?: string;
  labelAr?: string;
  ads?: Ad[];
}

export class CreateStateDto extends OmitType(StateDto, ['id', 'ads']) {
  labelEn: string;
  labelAr: string;
}

export class UpdateStateDto extends PartialType(CreateStateDto) {}
