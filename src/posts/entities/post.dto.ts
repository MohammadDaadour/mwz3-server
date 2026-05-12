import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;
}

export class GetPostsDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsOptional()
    search?: string;
}
