import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateParticipanteDto {
  @IsUUID()
  sesionId!: string;

  @IsString()
  usuarioId!: string;

  @IsString()
  @MaxLength(50)
  rol!: string; // DOCTOR | PACIENTE | INVITADO

  @IsOptional()
  @IsBoolean()
  conectado?: boolean;

  @IsOptional()
  @IsDateString()
  fechaConexion?: string;
}
