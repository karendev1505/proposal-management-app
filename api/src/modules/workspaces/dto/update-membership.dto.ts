import { IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class UpdateMembershipDto {
  @IsEnum(WorkspaceRole)
  @IsOptional()
  role?: WorkspaceRole;
}

