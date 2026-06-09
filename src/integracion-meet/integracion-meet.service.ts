import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google } from 'googleapis';

export interface MeetLinkResult {
  meetLink: string;
  meetEventId: string;
}

@Injectable()
export class IntegracionMeetService {
  private readonly logger = new Logger(IntegracionMeetService.name);

  private getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
  }

  async crearReunion(payload: {
    titulo: string;
    fecha: Date;
    duracionMinutos: number;
    pacienteId: string;
    usuarioId?: string;
  }): Promise<MeetLinkResult> {
    const credencialesCompletas =
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN;

    if (!credencialesCompletas) {
      this.logger.warn('Credenciales Google OAuth2 no configuradas — usando placeholder.');
      return {
        meetLink: `https://meet.google.com/placeholder-${Date.now()}`,
        meetEventId: `evt-placeholder-${Date.now()}`,
      };
    }

    try {
      const auth = this.getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth });

      const inicio = payload.fecha;
      const fin = new Date(inicio.getTime() + payload.duracionMinutos * 60 * 1000);

      const evento = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          summary: payload.titulo,
          start: { dateTime: inicio.toISOString(), timeZone: 'America/Bogota' },
          end:   { dateTime: fin.toISOString(),    timeZone: 'America/Bogota' },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}-${payload.pacienteId}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });

      const meetLink = evento.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video',
      )?.uri;

      const meetEventId = evento.data.id;

      if (!meetLink || !meetEventId) {
        throw new InternalServerErrorException('Google Calendar no retornó un link de Meet válido.');
      }

      return { meetLink, meetEventId };
    } catch (err) {
      this.logger.error('Error al crear evento en Google Calendar', err);
      throw new InternalServerErrorException('No se pudo crear la reunión de Google Meet.');
    }
  }

  async cancelarReunion(meetEventId: string): Promise<void> {
    if (meetEventId.startsWith('evt-placeholder')) return;

    const credencialesCompletas =
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN;

    if (!credencialesCompletas) return;

    try {
      const auth = this.getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth });
      await calendar.events.delete({ calendarId: 'primary', eventId: meetEventId });
    } catch (err) {
      this.logger.error(`Error al cancelar evento ${meetEventId}`, err);
    }
  }
}