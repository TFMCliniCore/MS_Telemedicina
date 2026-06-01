import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateVideoconsultaDto {
  @IsDateString()
  fecha!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duracionMinutos?: number = 30;

  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  /**
   * Si es true, el servicio intentará crear automáticamente
   * un evento de Google Meet al registrar la videoconsulta.
   */
  @IsOptional()
  @IsBoolean()
  crearMeet?: boolean = false;
}
