import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

@Injectable()
export class SesionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  async create(dto: CreateSesionDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId) await this.entidades.getUsuario(dto.usuarioId);

    if (dto.videoconsultaId) {
      await this.getVideoconsultaOrFail(dto.videoconsultaId);
    }

    return this.prisma.sesion.create({
      data: {
        ...dto,
        inicio: new Date(dto.inicio),
        ...(dto.fin && { fin: new Date(dto.fin) }),
        clienteId: paciente.cliente.id,
        estado: 'ACTIVA',
      },
    });
  }

  async findAll(filters: {
    desde?: string;
    hasta?: string;
    estado?: string;
    pacienteId?: number;
    videoconsultaId?: number;
  }) {
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        eliminado: false,
        ...(filters.desde           && { inicio: { gte: new Date(filters.desde) } }),
        ...(filters.hasta           && { inicio: { lte: new Date(filters.hasta) } }),
        ...(filters.estado          && { estado: filters.estado }),
        ...(filters.pacienteId      && { pacienteId: Number(filters.pacienteId) }),
        ...(filters.videoconsultaId && { videoconsultaId: Number(filters.videoconsultaId) }),
      },
      orderBy: { inicio: 'asc' },
    });

    if (sesiones.length === 0) return [];

    const pacienteIds = sesiones.map(s => s.pacienteId);
    const usuarioIds  = sesiones
      .map(s => s.usuarioId)
      .filter((id): id is number => id !== null);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return sesiones.map(s => ({
      ...s,
      paciente: pacientesMap.get(s.pacienteId) ?? null,
      usuario: s.usuarioId ? usuariosMap.get(s.usuarioId) ?? null : null,
    }));
  }

  async findOne(id: number) {
    const sesion = await this.getSesionOrFail(id);
    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(sesion.pacienteId),
      sesion.usuarioId
        ? this.entidades.getUsuario(sesion.usuarioId)
        : Promise.resolve(null),
    ]);
    return { ...sesion, paciente, usuario };
  }

  async update(id: number, dto: UpdateSesionDto) {
    await this.getSesionOrFail(id);
    if (dto.pacienteId)      await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId)       await this.entidades.getUsuario(dto.usuarioId);
    if (dto.videoconsultaId) await this.getVideoconsultaOrFail(dto.videoconsultaId);

    return this.prisma.sesion.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.inicio && { inicio: new Date(dto.inicio) }),
        ...(dto.fin    && { fin:    new Date(dto.fin) }),
      },
    });
  }

  async remove(id: number) {
    await this.getSesionOrFail(id);
    return this.prisma.sesion.update({
      where: { id },
      data: { eliminado: true, estado: 'INTERRUMPIDA' },
    });
  }

  private async getSesionOrFail(id: number) {
    const sesion = await this.prisma.sesion.findFirst({
      where: { id, eliminado: false },
    });
    if (!sesion) throw new NotFoundException(`Sesión con id ${id} no encontrada.`);
    return sesion;
  }

  private async getVideoconsultaOrFail(videoconsultaId: number) {
    const v = await this.prisma.videoconsulta.findFirst({
      where: { id: videoconsultaId, eliminado: false },
    });
    if (!v) throw new NotFoundException(`Videoconsulta con id ${videoconsultaId} no encontrada.`);
    return v;
  }
}
