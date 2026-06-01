# MS Telemedicina

Microservicio de telemedicina del ecosistema **CliniCore**. Gestiona videoconsultas, sesiones e integración con Google Meet.

## Tickets SCRUM relacionados

| Ticket | Descripción | Estado |
|--------|-------------|--------|
| SCRUM-331 | Esquema de BD (modelos `Videoconsulta` y `Sesion`) | ✅ Implementado |
| SCRUM-332 | Integración Google Meet | ⚙️ Listo para conectar (`IntegracionMeetService`) |
| SCRUM-333 | Registrar videoconsulta | ✅ `POST /api/v1/videoconsultas` |
| SCRUM-334 | Listado de videoconsultas | ✅ `GET /api/v1/videoconsultas` |
| SCRUM-390 | Unificar microservicios | Pendiente (API Gateway) |

## Stack

- **Runtime**: Node.js 22
- **Framework**: NestJS 11
- **ORM**: Prisma 6
- **DB**: PostgreSQL 16
- **Puerto**: `3004`

## Variables de entorno

```env
PORT=3004
POSTGRES_PORT=5435
POSTGRES_USER=clinicore_user
POSTGRES_PASSWORD=clinicore_pass
POSTGRES_DB=clinicore_telemedicina_db
DATABASE_URL=postgresql://USER:PASS@localhost:5435/clinicore_telemedicina_db?schema=public
MS_ENTIDADES_CORE_URL=http://localhost:3001/api/v1
# MS_MEET_URL=http://ms-integracion-meet:3005/api/v1   # Descomentar cuando SCRUM-332 esté listo
```

## Levantar en desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npm run prisma:generate

# 3. Correr migraciones
npm run prisma:migrate:dev

# 4. (Opcional) Cargar datos de prueba
npm run prisma:seed

# 5. Iniciar en modo watch
npm run start:dev
```

## Docker

```bash
docker-compose up --build
```

## Endpoints

### Videoconsultas — `api/v1/videoconsultas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Registrar videoconsulta (acepta `crearMeet: true` para generar link) |
| `GET` | `/` | Listar (`desde`, `hasta`, `estado`, `pacienteId`, `usuarioId`) |
| `GET` | `/:id` | Obtener por ID |
| `PATCH` | `/:id` | Actualizar parcial |
| `PUT` | `/:id` | Reemplazar |
| `DELETE` | `/:id` | Soft delete + cancelar Meet |

### Sesiones — `api/v1/sesiones`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Iniciar sesión |
| `GET` | `/` | Listar (`desde`, `hasta`, `estado`, `pacienteId`, `videoconsultaId`) |
| `GET` | `/:id` | Obtener por ID |
| `PATCH` | `/:id` | Actualizar (ej: agregar `fin` y cambiar estado a `FINALIZADA`) |
| `PUT` | `/:id` | Reemplazar |
| `DELETE` | `/:id` | Soft delete |

## Integración Google Meet (SCRUM-332)

El `IntegracionMeetService` está listo y espera la URL del microservicio de Meet en `MS_MEET_URL`.
Mientras ese servicio no esté desplegado, el campo se puede omitir o dejar comentado; el servicio
funcionará normalmente sin generar links reales.

Para crear una videoconsulta con Meet:
```json
POST /api/v1/videoconsultas
{
  "fecha": "2026-06-10T10:00:00Z",
  "motivo": "Control post-operatorio",
  "pacienteId": 1,
  "usuarioId": 1,
  "crearMeet": true
}
```

## Integración con API Gateway (SCRUM-390)

Este microservicio expone su prefijo en `/api/v1` y escucha en el puerto `3004`.
En el API Gateway, enrutar:
- `/telemedicina/videoconsultas/**` → `http://ms-telemedicina:3004/api/v1/videoconsultas`
- `/telemedicina/sesiones/**`       → `http://ms-telemedicina:3004/api/v1/sesiones`
