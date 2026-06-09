import { Body, Controller, Post } from '@nestjs/common';
import { MeetService } from './meet.service';
import { CreateMeetDto } from './dto/create-meet.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Post('create-link')
  createLink(@Body() dto: CreateMeetDto) {
    return this.meetService.createLink(dto);
  }

  @Post('start-session')
  startSession(@Body() dto: StartSessionDto) {
    return this.meetService.startSession(dto.videoconsultaId);
  }

  @Post('end-session')
  endSession(@Body() dto: EndSessionDto) {
    return this.meetService.endSession(dto.sesionId, dto.grabacionUrl);
  }
}