import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateSesionDto } from './create-sesion.dto';

export class UpdateSesionDto extends PartialType(CreateSesionDto) {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string; // ACTIVA | FINALIZADA | INTERRUMPIDA
}
