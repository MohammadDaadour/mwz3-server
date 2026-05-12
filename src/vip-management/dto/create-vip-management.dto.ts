import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsNumber, IsEmail, IsStrongPassword } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVipManagementDto {
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  credit: number
}

export class LoginVipUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
