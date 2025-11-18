import { IsString, IsOptional, MinLength } from 'class-validator';

export class RewriteToneDto {
  @IsString()
  @MinLength(10)
  text: string;

  @IsString()
  @MinLength(3)
  targetTone: string;

  @IsString()
  @IsOptional()
  model?: string;
}

