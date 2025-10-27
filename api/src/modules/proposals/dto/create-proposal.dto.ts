import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  REJECTED = 'REJECTED',
}

export class CreateProposalDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;
}
