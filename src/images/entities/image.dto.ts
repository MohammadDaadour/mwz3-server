export class ImageDto {
  readonly id?: number;
  scope?: string;
  ref?: string;
  mime?: string;
}

export class CreateImageDto extends ImageDto {
  id: number;
  scope: string;
  ref?: string;
  mime: string;
}
