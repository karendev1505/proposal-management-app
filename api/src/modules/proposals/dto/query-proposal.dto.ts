import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProposalStatus } from '@prisma/client';

export class QueryProposalDto {
  @IsOptional()
  @IsEnum(ProposalStatus, { message: 'Invalid proposal status' })
  status?: ProposalStatus;

  @IsOptional()
  @IsString({ message: 'Invalid search query' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
