import { IsString, IsEmail, IsOptional } from 'class-validator';

export class SendProposalDto {
  @IsString()
  proposalId: string;

  @IsEmail()
  recipientEmail: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
