import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto {
  name?: string;
  content?: string;
  category?: string;
  isActive?: boolean;
}
