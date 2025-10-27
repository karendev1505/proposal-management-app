import { IsString, IsOptional } from 'class-validator';

export class SignDto {
  @IsString()
  proposalId: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
