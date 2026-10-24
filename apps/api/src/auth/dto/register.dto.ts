import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { GlobalRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // FLAW 5 FIX: Only allow STUDENT or FACULTY via public endpoint
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
  identifier: string;
}
