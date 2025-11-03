import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// removed invalid import from @prisma/client; `type` will be a plain string

export class CreateTemplateDto {
  @ApiProperty()
  @IsString({ message: 'Invalid template name' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'Invalid template type' })
  type: string;

  @ApiProperty()
  @IsString({ message: 'Invalid template content' })
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Invalid template subject' })
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Invalid template category' })
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'Invalid template visibility' })
  isPublic?: boolean;
}
