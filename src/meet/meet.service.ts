import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntegracionMeetService } from '../integracion-meet/integracion-meet.service';
import { CreateMeetDto } from './dto/create-meet.dto';
import { VIDEOCONSULTA_ESTADOS, SESION_ESTADOS } from '../common/constants/entity-status.constants';

@Injectable()
export class MeetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly integracionMeet: IntegracionMeetService,
  ) {}

  /** POST /meet/create-link — genera enlace y lo asocia a la videoconsulta */
  async createLink(dto: CreateMeetDto) {
    if (dto.videoconsultaId) await this.getVideoconsultaOrFail(dto.videoconsultaId);
    const result = await this.integracionMeet.crearReunion({
      titulo: dto.titulo,
      fecha: new Date(dto.fecha),
      duracionMinutos: dto.duracionMinutos ?? 30,
      pacienteId: dto.pacienteId,
      usuarioId: dto.usuarioId,
    });

    if (dto.videoconsultaId) {
      await this.prisma.videoconsulta.update({
        where: { id: dto.videoconsultaId },
        data: { enlaceMeet: result.meetLink, meetEventId: result.meetEventId },
      });
    }

    return result;
  }

  /** POST /meet/start-session — inicia la sesión ligada a la videoconsulta */
  async startSession(videoconsultaId: string) {
    let v = await this.getVideoconsultaOrFail(videoconsultaId);

    if (!v.enlaceMeet || !v.meetEventId) {
      const reunion = await this.integracionMeet.crearReunion({
        titulo: `Videoconsulta: ${v.motivo}`,
        fecha: v.fecha,
        duracionMinutos: v.duracionMinutos,
        pacienteId: v.pacienteId,
        usuarioId: v.usuarioId ?? undefined,
      });
      v = await this.prisma.videoconsulta.update({
        where: { id: v.id },
        data: { enlaceMeet: reunion.meetLink, meetEventId: reunion.meetEventId },
      });
    }

    const sesionActiva = await this.prisma.sesion.findFirst({
      where: { videoconsultaId, eliminado: false, estado: SESION_ESTADOS.ACTIVA },
    });
    if (sesionActiva) {
      await this.prisma.videoconsulta.update({
        where: { id: videoconsultaId },
        data: { estado: VIDEOCONSULTA_ESTADOS.EN_CURSO },
      });
      return { sesion: sesionActiva, enlaceMeet: v.enlaceMeet, meetEventId: v.meetEventId };
    }

    const sesion = await this.prisma.sesion.create({
      data: {
        horaInicio: new Date(),
        estado: SESION_ESTADOS.ACTIVA,
        pacienteId: v.pacienteId,
        clienteId: v.clienteId,
        usuarioId: v.usuarioId,
        videoconsultaId: v.id,
      },
    });

    await this.prisma.videoconsulta.update({
      where: { id: videoconsultaId },
      data: { estado: VIDEOCONSULTA_ESTADOS.EN_CURSO },
    });

    return { sesion, enlaceMeet: v.enlaceMeet, meetEventId: v.meetEventId };
  }

  /** POST /meet/end-session — finaliza la sesión activa */
  async endSession(sesionId: string, grabacionUrl?: string) {
    const sesion = await this.prisma.sesion.findFirst({
      where: { id: sesionId, eliminado: false },
    });
    if (!sesion) throw new NotFoundException(`Sesión ${sesionId} no encontrada.`);

    const sesionFinalizada = await this.prisma.sesion.update({
      where: { id: sesionId },
      data: {
        horaFin: new Date(),
        estado: SESION_ESTADOS.FINALIZADA,
        ...(grabacionUrl && { grabacionUrl }),
      },
    });

    if (sesion.videoconsultaId && sesion.estado === SESION_ESTADOS.ACTIVA) {
      await this.prisma.videoconsulta.update({
        where: { id: sesion.videoconsultaId },
        data: { estado: VIDEOCONSULTA_ESTADOS.COMPLETADA },
      });
    }

    return sesionFinalizada;
  }

  private async getVideoconsultaOrFail(id: string) {
    const v = await this.prisma.videoconsulta.findFirst({ where: { id, eliminado: false } });
    if (!v) throw new NotFoundException(`Videoconsulta ${id} no encontrada.`);
    return v;
  }
}
