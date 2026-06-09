import {
  Body, Controller, Delete, Get, Param,
  Patch, Post, Put, Query,
} from '@nestjs/common';
import { VideoconsultasService } from './videoconsultas.service';
import { CreateVideoconsultaDto } from './dto/create-videoconsulta.dto';
import { UpdateVideoconsultaDto } from './dto/update-videoconsulta.dto';

@Controller('videoconsultas')
export class VideoconsultasController {
  constructor(private readonly videoconsultasService: VideoconsultasService) {}

  @Post()
  create(@Body() dto: CreateVideoconsultaDto) {
    return this.videoconsultasService.create(dto);
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.videoconsultasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoconsultasService.remove(id);
  }
}