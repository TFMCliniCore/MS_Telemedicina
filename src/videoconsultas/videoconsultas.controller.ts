import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
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
    return this.videoconsultasService.findAll({
      desde,
      hasta,
      estado,
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
      usuarioId:  usuarioId  ? Number(usuarioId)  : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videoconsultasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVideoconsultaDto) {
    return this.videoconsultasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.videoconsultasService.remove(id);
  }
}
