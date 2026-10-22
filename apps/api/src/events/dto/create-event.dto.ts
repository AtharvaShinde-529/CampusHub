import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsString() @IsNotEmpty() organizationId: string;
  
  @IsBoolean() @IsOptional() isFest?: boolean;
  @IsString() @IsOptional() parentEventId?: string;
}
