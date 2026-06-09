import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSesionDto {
  @IsDateString()
  horaInicio!: string;

  @IsOptional()
  @IsDateString()
  horaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string;

  @IsString()
  pacienteId!: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  videoconsultaId?: string;
}