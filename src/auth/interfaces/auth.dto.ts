import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  pass: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  area: string; // You may change this to number if you're expecting a number in request

  @IsOptional()
  phone?: string;
}

// export class RegisterDto {
//   email: string;
//   pass: string;
//   name: string;
//   area: string;
//   phone?: string;
// }
