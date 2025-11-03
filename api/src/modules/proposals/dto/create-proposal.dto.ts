import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateProposalDto {
  @IsString({ message: 'Invalid proposal title' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Invalid proposal content' })
  content?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid client email' })
  clientEmail?: string;

  @IsOptional()
  @IsString({ message: 'Invalid client name' })
  clientName?: string;

  @IsOptional()
  @IsString({ message: 'Invalid template id' })
  templateId?: string;
}
