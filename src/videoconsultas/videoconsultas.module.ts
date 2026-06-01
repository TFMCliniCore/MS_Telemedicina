import { Module } from '@nestjs/common';
import { VideoconsultasController } from './videoconsultas.controller';
import { VideoconsultasService } from './videoconsultas.service';

@Module({
  controllers: [VideoconsultasController],
  providers: [VideoconsultasService],
})
export class VideoconsultasModule {}
