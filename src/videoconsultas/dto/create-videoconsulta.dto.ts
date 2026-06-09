import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVideoconsultaDto {
  @IsDateString()
  fecha!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duracionMinutos?: number;

  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsString()
  pacienteId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  especialidadId?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsBoolean()
  crearMeet?: boolean;
}