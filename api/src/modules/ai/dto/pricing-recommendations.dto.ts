import { IsString, IsOptional, MinLength, IsArray } from 'class-validator';

export class PricingRecommendationsDto {
  @IsString()
  @MinLength(10)
  projectDescription: string;

  @IsArray()
  @IsOptional()
  pricingHistory?: any[];
}

