import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBlogCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    parentId?: number;
}

export class UpdateBlogCommentDto {
    @IsString()
    @IsNotEmpty()
    content?: string;
}