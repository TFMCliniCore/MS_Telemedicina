import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

export interface MeetLinkResult {
  meetLink: string;
  meetEventId: string;
}

/**
 * Servicio de integración con Google Meet.
 *
 * Actualmente expone el método `crearReunion` que:
 *  1. Llama al MS Integracion Google Meet (SCRUM-332) si la variable
 *     MS_MEET_URL está configurada.
 *  2. Retorna un link de Meet y el eventId del calendario para guardarlo
 *     en la videoconsulta.
 *
 * Si MS_MEET_URL no está configurada (entorno de desarrollo local),
 * devuelve un link de placeholder para no bloquear el flujo.
 */
@Injectable()
export class IntegracionMeetService {
  private readonly logger = new Logger(IntegracionMeetService.name);
  private readonly meetUrl: string | undefined;

  constructor() {
    this.meetUrl = process.env.MS_MEET_URL;
  }

  async crearReunion(payload: {
    titulo: string;
    fecha: Date;
    duracionMinutos: number;
    pacienteId: number;
    usuarioId?: number;
  }): Promise<MeetLinkResult> {
    if (!this.meetUrl) {
      this.logger.warn('MS_MEET_URL no configurado — usando link de placeholder.');
      return {
        meetLink: `https://meet.google.com/placeholder-${Date.now()}`,
        meetEventId: `evt-placeholder-${Date.now()}`,
      };
    }

    try {
      const res = await fetch(`${this.meetUrl}/reuniones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new InternalServerErrorException(
          `Error al crear reunión en Google Meet: ${res.status}`,
        );
      }

      return res.json() as Promise<MeetLinkResult>;
    } catch (err) {
      this.logger.error('Fallo al contactar ms-meet', err);
      throw new InternalServerErrorException('No se pudo crear la reunión de Google Meet.');
    }
  }

  async cancelarReunion(meetEventId: string): Promise<void> {
    if (!this.meetUrl || !meetEventId || meetEventId.startsWith('evt-placeholder')) {
      return;
    }

    try {
      await fetch(`${this.meetUrl}/reuniones/${meetEventId}`, { method: 'DELETE' });
    } catch (err) {
      this.logger.error(`Fallo al cancelar reunión ${meetEventId}`, err);
    }
  }
}
