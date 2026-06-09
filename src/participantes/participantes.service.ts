import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@Injectable()
export class ParticipantesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateParticipanteDto) {
    await this.getSesionOrFail(dto.sesionId);
    return this.prisma.participante.create({
      data: {
        ...dto,
        ...(dto.fechaConexion && { fechaConexion: new Date(dto.fechaConexion) }),
      },
    });
  }

  async findBySesion(sesionId: string) {
    await this.getSesionOrFail(sesionId);
    return this.prisma.participante.findMany({
      where: { sesionId, eliminado: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.getOrFail(id);
  }

  async update(id: string, dto: UpdateParticipanteDto) {
    await this.getOrFail(id);
    return this.prisma.participante.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fechaConexion && { fechaConexion: new Date(dto.fechaConexion) }),
      },
    });
  }

  async remove(id: string) {
    await this.getOrFail(id);
    return this.prisma.participante.update({
      where: { id },
      data: { eliminado: true, conectado: false },
    });
  }

  private async getOrFail(id: string) {
    const p = await this.prisma.participante.findFirst({ where: { id, eliminado: false } });
    if (!p) throw new NotFoundException(`Participante ${id} no encontrado.`);
    return p;
  }

  private async getSesionOrFail(sesionId: string) {
    const s = await this.prisma.sesion.findFirst({ where: { id: sesionId, eliminado: false } });
    if (!s) throw new NotFoundException(`Sesión ${sesionId} no encontrada.`);
    return s;
  }

  async findAll(filters: {
    sesionId?: string;
    usuarioId?: string;
    conectado?: boolean;
  }) {
    return this.prisma.participante.findMany({
      where: {
        eliminado: false,
        ...(filters.sesionId && { sesionId: filters.sesionId }),
        ...(filters.usuarioId && { usuarioId: filters.usuarioId }),
        ...(filters.conectado !== undefined && { conectado: filters.conectado }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
