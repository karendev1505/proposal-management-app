import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class QueryTemplateDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
