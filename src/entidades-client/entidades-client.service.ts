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
    this.baseUrl = process.env.MS_ENTIDADES_URL ?? process.env.MS_ENTIDADES_CORE_URL ?? 'http://ms-entidades-api:3001/api/v1';
  }

  async getPaciente(id: string | number): Promise<PacienteRemoto> {
    const res = await fetch(`${this.baseUrl}/pacientes/${id}`);
    if (res.status === 404) throw new NotFoundException(`Paciente ${id} no encontrado.`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades: ${res.status}`);
    return res.json() as Promise<PacienteRemoto>;
  }

  async getUsuario(id: string | number): Promise<UsuarioRemoto> {
    const res = await fetch(`${this.baseUrl}/usuarios/${id}`);
    if (res.status === 404) throw new NotFoundException(`Usuario ${id} no encontrado.`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades: ${res.status}`);
    return res.json() as Promise<UsuarioRemoto>;
  }

  async getPacientesByIds(ids: (string | number)[]): Promise<Map<string, PacienteRemoto>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/pacientes`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades pacientes: ${res.status}`);
    const all = await res.json() as PacienteRemoto[];
    const idSet = new Set(ids.map(String));
    return new Map(
      all.filter(p => idSet.has(String(p.id))).map(p => [String(p.id), p])
    );
  }

  async getUsuariosByIds(ids: (string | number)[]): Promise<Map<string, UsuarioRemoto>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/usuarios`);
    if (!res.ok) throw new InternalServerErrorException(`Error ms-entidades usuarios: ${res.status}`);
    const all = await res.json() as UsuarioRemoto[];
    const idSet = new Set(ids.map(String));
    return new Map(
      all.filter(u => idSet.has(String(u.id))).map(u => [String(u.id), u])
    );
  }
}