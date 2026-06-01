import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EntidadesClientModule } from './entidades-client/entidades-client.module';
import { IntegracionMeetModule } from './integracion-meet/integracion-meet.module';
import { VideoconsultasModule } from './videoconsultas/videoconsultas.module';
import { SesionesModule } from './sesiones/sesiones.module';

@Module({
  imports: [
    PrismaModule,
    EntidadesClientModule,
    IntegracionMeetModule,
    VideoconsultasModule,
    SesionesModule,
  ],
})
export class AppModule {}
