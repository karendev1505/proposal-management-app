import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
