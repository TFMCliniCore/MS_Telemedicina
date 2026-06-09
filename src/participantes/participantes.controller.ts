import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query,
} from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Post()
  create(@Body() dto: CreateParticipanteDto) {
    return this.participantesService.create(dto);
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.participantesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.participantesService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.participantesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantesService.remove(id);
  }
}
