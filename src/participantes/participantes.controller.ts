import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@ApiTags('Control de Participantes')
@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un participante (médico o paciente) en una sesión de telemedicina' })
  create(@Body() dto: CreateParticipanteDto) {
    return this.participantesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar y filtrar participantes según sesión, ID de usuario o estado de conexión' })
  findAll(
    @Query('sesionId')   sesionId?: string,
    @Query('usuarioId')  usuarioId?: string,
    @Query('conectado')  conectado?: string,
  ) {
    return this.participantesService.findAll({
      sesionId,
      usuarioId,
      conectado: conectado !== undefined ? conectado === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de conexión y rol de un participante mediante su ID' })
  findOne(@Param('id') id: string) {
    return this.participantesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar de forma parcial el estado de conexión o datos del participante' })
  update(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.participantesService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar por completo el registro de control del participante' })
  replace(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.participantesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover a un participante del registro de la sesión' })
  remove(@Param('id') id: string) {
    return this.participantesService.remove(id);
  }
}