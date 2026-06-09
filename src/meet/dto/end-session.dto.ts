import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EndSessionDto {
  @IsUUID()
  sesionId!: string;

  @IsOptional()
  @IsString()
  grabacionUrl?: string;
}