import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Put, Query,
} from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Post()
  create(@Body() dto: CreateSesionDto) {
    return this.sesionesService.create(dto);
  }

  @Get()
  findAll(
    @Query('desde')           desde?: string,
    @Query('hasta')           hasta?: string,
    @Query('estado')          estado?: string,
    @Query('pacienteId')      pacienteId?: string,
    @Query('videoconsultaId') videoconsultaId?: string,
  ) {
    return this.sesionesService.findAll({
      desde,
      hasta,
      estado,
      pacienteId:      pacienteId      ? Number(pacienteId)      : undefined,
      videoconsultaId: videoconsultaId ? Number(videoconsultaId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sesionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSesionDto) {
    return this.sesionesService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSesionDto) {
    return this.sesionesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sesionesService.remove(id);
  }
}
