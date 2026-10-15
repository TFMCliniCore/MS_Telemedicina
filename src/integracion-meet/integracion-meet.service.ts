import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
      throw new ServiceUnavailableException(
        'La integración de Google Meet no está configurada. Verifique las variables de OAuth requeridas.',
      );
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
              requestId: randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });

      const meetEventId = evento.data.id;
      if (!meetEventId) {
        throw new InternalServerErrorException('Google Calendar no retornó el identificador del evento.');
      }

      let meetLink = evento.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video',
      )?.uri;

      // Google Calendar can return the event while Meet is still provisioning the conference.
      for (let intento = 0; !meetLink && intento < 5; intento += 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const eventoActualizado = await calendar.events.get({
          calendarId: 'primary',
          eventId: meetEventId,
        });
        meetLink = eventoActualizado.data.conferenceData?.entryPoints?.find(
          ep => ep.entryPointType === 'video',
        )?.uri;
      }

      if (!meetLink) {
        throw new InternalServerErrorException('Google Calendar no retornó un link de Meet válido.');
      }

      return { meetLink, meetEventId };
    } catch (err) {
      this.logger.error('Error al crear evento en Google Calendar', err);
      throw new InternalServerErrorException('No se pudo crear la reunión de Google Meet.');
    }
  }

  async cancelarReunion(meetEventId: string): Promise<void> {
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
