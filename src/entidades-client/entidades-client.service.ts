import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';

export interface PacienteRemoto {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  cliente: { id: number; nombres: string; celular: string; email: string };
}

export interface UsuarioRemoto {
  id: number;
  nombres: string;
  email: string;
  cargo: string;
}

@Injectable()
export class EntidadesClientService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MS_ENTIDADES_URL ?? 'http://ms-entidades:3001/api/v1';
  }

  // ── Validaciones individuales (para POST/PUT) ─────────────────────────────

  async getPaciente(id: number): Promise<PacienteRemoto> {
    const res = await fetch(`${this.baseUrl}/pacientes/${id}`);
    if (res.status === 404) throw new NotFoundException(`Paciente ${id} no encontrado.`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades: ${res.status}`);
    return res.json() as Promise<PacienteRemoto>;
  }

  async getUsuario(id: number): Promise<UsuarioRemoto> {
    const res = await fetch(`${this.baseUrl}/usuarios/${id}`);
    if (res.status === 404) throw new NotFoundException(`Usuario ${id} no encontrado.`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades: ${res.status}`);
    return res.json() as Promise<UsuarioRemoto>;
  }

  // ── Consultas en lote (para GET /videoconsultas, GET /sesiones, etc.) ─────
  // ms-entidades no soporta ?ids=, así que traemos todo y filtramos en memoria

  async getPacientesByIds(ids: number[]): Promise<Map<number, PacienteRemoto>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/pacientes`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades pacientes: ${res.status}`);
    const all = await res.json() as PacienteRemoto[];
    const idSet = new Set(ids);
    return new Map(all.filter(p => idSet.has(p.id)).map(p => [p.id, p]));
  }

  async getUsuariosByIds(ids: number[]): Promise<Map<number, UsuarioRemoto>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/usuarios`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades usuarios: ${res.status}`);
    const all = await res.json() as UsuarioRemoto[];
    const idSet = new Set(ids);
    return new Map(all.filter(u => idSet.has(u.id)).map(u => [u.id, u]));
  }
}
