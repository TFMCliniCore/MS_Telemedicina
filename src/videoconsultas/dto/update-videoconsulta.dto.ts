import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateVideoconsultaDto } from './create-videoconsulta.dto';

export class UpdateVideoconsultaDto extends PartialType(CreateVideoconsultaDto) {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  enlaceMeet?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  meetEventId?: string;
}
