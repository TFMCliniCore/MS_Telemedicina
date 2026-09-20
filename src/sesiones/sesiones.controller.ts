import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

@ApiTags('Sesiones de Telemedicina')
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sesión activa o sala virtual vinculada a una consulta médica' })
  create(@Body() dto: CreateSesionDto) {
    return this.sesionesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar y filtrar sesiones por rango de fechas, estado, paciente o ID de videoconsulta' })
  findAll(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estado') estado?: string,
    @Query('pacienteId') pacienteId?: string,
    @Query('videoconsultaId') videoconsultaId?: string,
  ) {
    return this.sesionesService.findAll({
      desde,
      hasta,
      estado,
      pacienteId,
      videoconsultaId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar el estado detallado, tiempos de duración y metadatos de una sesión por ID' })
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente la información, estado o grabación de la sesión' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSesionDto,
  ) {
    return this.sesionesService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Sobrescribir por completo la estructura de datos de una sesión clínica' })
  replace(
    @Param('id') id: string,
    @Body() dto: UpdateSesionDto,
  ) {
    return this.sesionesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sesión del registro del sistema (con fines de auditoría)' })
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}