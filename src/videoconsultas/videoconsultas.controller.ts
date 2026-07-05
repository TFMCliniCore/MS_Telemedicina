import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VideoconsultasService } from './videoconsultas.service';
import { CreateVideoconsultaDto } from './dto/create-videoconsulta.dto';
import { UpdateVideoconsultaDto } from './dto/update-videoconsulta.dto';

@ApiTags('Agendamiento de Videoconsultas')
@Controller('videoconsultas')
export class VideoconsultasController {
  constructor(private readonly videoconsultasService: VideoconsultasService) {}

  @Post()
  @ApiOperation({ summary: 'Agendar una nueva cita médica virtual con asignación de profesionales' })
  create(@Body() dto: CreateVideoconsultaDto) {
    return this.videoconsultasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar videoconsultas agendadas filtrando por rango de tiempo, estados, paciente o médico' })
  findAll(
    @Query('desde')      desde?: string,
    @Query('hasta')      hasta?: string,
    @Query('estado')     estado?: string,
    @Query('pacienteId') pacienteId?: string,
    @Query('usuarioId')  usuarioId?: string,
  ) {
    return this.videoconsultasService.findAll({ desde, hasta, estado, pacienteId, usuarioId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los datos específicos de agendamiento y preparación de una videoconsulta por ID' })
  findOne(@Param('id') id: string) {
    return this.videoconsultasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Reprogramar o modificar campos específicos del registro de una videoconsulta' })
  update(@Param('id') id: string, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar en su totalidad el registro de agendamiento de la videoconsulta' })
  replace(@Param('id') id: string, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar el agendamiento de una videoconsulta del historial activo' })
  remove(@Param('id') id: string) {
    return this.videoconsultasService.remove(id);
  }
}