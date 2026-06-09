import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { SESION_ESTADOS } from '../common/constants/entity-status.constants';

@Injectable()
export class SesionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  async create(dto: CreateSesionDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);

    if (dto.usuarioId) {
      await this.entidades.getUsuario(dto.usuarioId);
    }

    if (dto.videoconsultaId) {
      await this.getVideoconsultaOrFail(dto.videoconsultaId);
    }

    return this.prisma.sesion.create({
      data: {
        horaInicio: new Date(dto.horaInicio),
        horaFin: dto.horaFin ? new Date(dto.horaFin) : null,

        notas: dto.notas,

        pacienteId: dto.pacienteId,
        usuarioId: dto.usuarioId,
        videoconsultaId: dto.videoconsultaId,

        clienteId: String(paciente.cliente.id),
        estado: SESION_ESTADOS.ACTIVA,
      },
    });
  }

  async findAll(filters: {
    desde?: string;
    hasta?: string;
    estado?: string;
    pacienteId?: string;
    videoconsultaId?: string;
  }) {
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        eliminado: false,

        ...(filters.desde && {
          horaInicio: {
            gte: new Date(filters.desde),
          },
        }),

        ...(filters.hasta && {
          horaInicio: {
            lte: new Date(filters.hasta),
          },
        }),

        ...(filters.estado && {
          estado: filters.estado,
        }),

        ...(filters.pacienteId && {
          pacienteId: filters.pacienteId,
        }),

        ...(filters.videoconsultaId && {
          videoconsultaId: filters.videoconsultaId,
        }),
      },

      orderBy: {
        horaInicio: 'asc',
      },
    });

    if (!sesiones.length) {
      return [];
    }

    const pacienteIds = sesiones.map((s) => s.pacienteId);

    const usuarioIds = sesiones
      .map((s) => s.usuarioId)
      .filter((id): id is string => !!id);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return sesiones.map((s) => ({
      ...s,
      paciente: pacientesMap.get(s.pacienteId) ?? null,
      usuario: s.usuarioId
        ? usuariosMap.get(s.usuarioId) ?? null
        : null,
    }));
  }

  async findOne(id: string) {
    const sesion = await this.getSesionOrFail(id);

    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(sesion.pacienteId),

      sesion.usuarioId
        ? this.entidades.getUsuario(sesion.usuarioId)
        : Promise.resolve(null),
    ]);

    return {
      ...sesion,
      paciente,
      usuario,
    };
  }

  async update(id: string, dto: UpdateSesionDto) {
    await this.getSesionOrFail(id);

    if (dto.pacienteId) {
      await this.entidades.getPaciente(dto.pacienteId);
    }

    if (dto.usuarioId) {
      await this.entidades.getUsuario(dto.usuarioId);
    }

    if (dto.videoconsultaId) {
      await this.getVideoconsultaOrFail(dto.videoconsultaId);
    }

    return this.prisma.sesion.update({
      where: { id },

      data: {
        ...(dto.horaInicio && {
          horaInicio: new Date(dto.horaInicio),
        }),

        ...(dto.horaFin && {
          horaFin: new Date(dto.horaFin),
        }),

        ...(dto.notas !== undefined && {
          notas: dto.notas,
        }),

        ...(dto.pacienteId && {
          pacienteId: dto.pacienteId,
        }),

        ...(dto.usuarioId && {
          usuarioId: dto.usuarioId,
        }),

        ...(dto.videoconsultaId && {
          videoconsultaId: dto.videoconsultaId,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.getSesionOrFail(id);

    return this.prisma.sesion.update({
      where: { id },
      data: {
        eliminado: true,
        estado: SESION_ESTADOS.INTERRUMPIDA,
      },
    });
  }

  private async getSesionOrFail(id: string) {
    const sesion = await this.prisma.sesion.findFirst({
      where: {
        id,
        eliminado: false,
      },
    });

    if (!sesion) {
      throw new NotFoundException(
        `Sesión con id ${id} no encontrada.`,
      );
    }

    return sesion;
  }

  private async getVideoconsultaOrFail(id: string) {
    const videoconsulta = await this.prisma.videoconsulta.findFirst({
      where: {
        id,
        eliminado: false,
      },
    });

    if (!videoconsulta) {
      throw new NotFoundException(
        `Videoconsulta con id ${id} no encontrada.`,
      );
    }

    return videoconsulta;
  }
}