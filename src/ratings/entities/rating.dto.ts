import { PartialType, OmitType } from '@nestjs/mapped-types';

export class RatingDto {
  id?: number;
  type?: string;
  ref?: number;
  value?: number;
  userFK?: number;
}

export class CreateRatingDto extends OmitType(RatingDto, ['id']) {
  type: string;
  ref: number;
  value: number;
  userFK: number;
}

export class UpdateRatingDto extends PartialType(CreateRatingDto) {}