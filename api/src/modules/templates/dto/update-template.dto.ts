import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateDto } from './create-template.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @IsOptional()
  @IsString({ message: 'Invalid template name' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Invalid template content' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'Invalid template category' })
  category?: string;

  @IsOptional()
  @IsBoolean({ message: 'Invalid template visibility' })
  isPublic?: boolean;
}
