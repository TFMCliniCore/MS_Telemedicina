import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación esencial
import { MeetService } from './meet.service';
import { CreateMeetDto } from './dto/create-meet.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@ApiTags('Integración Google Meet') // 👈 Agrupa en el Swagger
@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Post('create-link')
  @ApiOperation({ summary: 'Generar un enlace de Google Meet para una consulta virtual' })
  createLink(@Body() dto: CreateMeetDto) {
    return this.meetService.createLink(dto);
  }

  @Post('start-session')
  @ApiOperation({ summary: 'Iniciar formalmente la sesión y activar los triggers de la reunión' })
  startSession(@Body() dto: StartSessionDto) {
    return this.meetService.startSession(dto.videoconsultaId);
  }

  @Post('end-session')
  @ApiOperation({ summary: 'Finalizar la sesión de la videollamada y registrar la URL de la grabación' })
  endSession(@Body() dto: EndSessionDto) {
    return this.meetService.endSession(dto.sesionId, dto.grabacionUrl);
  }
}