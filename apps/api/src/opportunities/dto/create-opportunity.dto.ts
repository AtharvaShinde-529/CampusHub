import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  deadline: string;
}
