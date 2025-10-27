import { IsString, IsOptional, IsEmail } from 'class-validator';

export class ProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
