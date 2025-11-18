import { IsString, IsOptional, MinLength } from 'class-validator';

export class ImproveSectionDto {
  @IsString()
  @MinLength(10)
  section: string;

  @IsString()
  @IsOptional()
  tone?: string;

  @IsString()
  @IsOptional()
  model?: string;
}

