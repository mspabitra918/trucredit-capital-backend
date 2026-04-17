import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9+\-\s]{7,15}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
