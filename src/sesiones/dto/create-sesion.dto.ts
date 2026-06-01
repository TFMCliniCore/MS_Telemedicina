import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSesionDto {
  @IsDateString()
  inicio!: string;

  @IsOptional()
  @IsDateString()
  fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string;

  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  videoconsultaId?: number;
}
