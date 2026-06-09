import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMeetDto {
  @IsString()
  @MaxLength(200)
  titulo!: string;

  @IsDateString()
  fecha!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duracionMinutos?: number = 30;

  @IsString()
  pacienteId!: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  videoconsultaId?: string;
}
