import { Module } from '@nestjs/common';
import { ParticipantesController } from './participantes.controller';
import { ParticipantesService } from './participantes.service';

@Module({
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
})
export class ParticipantesModule {}
