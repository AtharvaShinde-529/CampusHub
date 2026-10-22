import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { GlobalRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(GlobalRole)
  role: GlobalRole;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  identifier: string; // rollNumber for students, designation for faculty
}
