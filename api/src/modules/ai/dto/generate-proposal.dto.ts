import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
} from 'class-validator';

export class GenerateProposalDto {
  @IsString()
  @MinLength(10)
  projectDescription: string;

  @IsString()
  @IsOptional()
  clientInfo?: string;

  @IsEnum(['formal', 'friendly', 'salesy'])
  @IsOptional()
  tone?: 'formal' | 'friendly' | 'salesy';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sections?: string[];

  @IsString()
  @IsOptional()
  model?: string;
}

