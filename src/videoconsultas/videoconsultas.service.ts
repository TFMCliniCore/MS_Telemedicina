import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { IntegracionMeetService } from '../integracion-meet/integracion-meet.service';
import { CreateVideoconsultaDto } from './dto/create-videoconsulta.dto';
import { UpdateVideoconsultaDto } from './dto/update-videoconsulta.dto';

@Injectable()
export class VideoconsultasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
    private readonly meet: IntegracionMeetService,
  ) {}

  async create(dto: CreateVideoconsultaDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId) await this.entidades.getUsuario(dto.usuarioId);

    let meetLink: string | undefined;
    let meetEventId: string | undefined;

    if (dto.crearMeet) {
      const result = await this.meet.crearReunion({
        titulo: `Videoconsulta: ${dto.motivo}`,
        fecha: new Date(dto.fecha),
        duracionMinutos: dto.duracionMinutos ?? 30,
        pacienteId: dto.pacienteId,
        usuarioId: dto.usuarioId,
      });
      meetLink = result.meetLink;
      meetEventId = result.meetEventId;
    }

    const { crearMeet, ...data } = dto;

    return this.prisma.videoconsulta.create({
      data: {
        ...data,
        fecha: new Date(dto.fecha),
        clienteId: paciente.cliente.id,
        estado: 'PENDIENTE',
        ...(meetLink    && { meetLink }),
        ...(meetEventId && { meetEventId }),
      },
    });
  }

  async findAll(filters: {
    desde?: string;
    hasta?: string;
    estado?: string;
    pacienteId?: number;
    usuarioId?: number;
  }) {
    const videoconsultas = await this.prisma.videoconsulta.findMany({
      where: {
        eliminado: false,
        ...(filters.desde      && { fecha: { gte: new Date(filters.desde) } }),
        ...(filters.hasta      && { fecha: { lte: new Date(filters.hasta) } }),
        ...(filters.estado     && { estado: filters.estado }),
        ...(filters.pacienteId && { pacienteId: Number(filters.pacienteId) }),
        ...(filters.usuarioId  && { usuarioId:  Number(filters.usuarioId) }),
      },
      orderBy: { fecha: 'asc' },
    });

    if (videoconsultas.length === 0) return [];

    const pacienteIds = videoconsultas.map(v => v.pacienteId);
    const usuarioIds  = videoconsultas
      .map(v => v.usuarioId)
      .filter((id): id is number => id !== null);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return videoconsultas.map(v => ({
      ...v,
      paciente: pacientesMap.get(v.pacienteId) ?? null,
      usuario: v.usuarioId ? usuariosMap.get(v.usuarioId) ?? null : null,
    }));
  }

  async findOne(id: number) {
    const videoconsulta = await this.getVideoconsultaOrFail(id);
    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(videoconsulta.pacienteId),
      videoconsulta.usuarioId
        ? this.entidades.getUsuario(videoconsulta.usuarioId)
        : Promise.resolve(null),
    ]);
    return { ...videoconsulta, paciente, usuario };
  }

  async update(id: number, dto: UpdateVideoconsultaDto) {
    await this.getVideoconsultaOrFail(id);
    if (dto.pacienteId) await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId)  await this.entidades.getUsuario(dto.usuarioId);

    const { crearMeet, ...data } = dto;

    return this.prisma.videoconsulta.update({
      where: { id },
      data: {
        ...data,
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
      },
    });
  }

  async remove(id: number) {
    const videoconsulta = await this.getVideoconsultaOrFail(id);

    // Intentar cancelar el evento de Meet si existe
    if (videoconsulta.meetEventId) {
      await this.meet.cancelarReunion(videoconsulta.meetEventId);
    }

    return this.prisma.videoconsulta.update({
      where: { id },
      data: { eliminado: true, estado: 'CANCELADA' },
    });
  }

  private async getVideoconsultaOrFail(id: number) {
    const v = await this.prisma.videoconsulta.findFirst({
      where: { id, eliminado: false },
    });
    if (!v) throw new NotFoundException(`Videoconsulta con id ${id} no encontrada.`);
    return v;
  }
}
