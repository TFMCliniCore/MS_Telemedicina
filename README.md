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
GOOGLE_CLIENT_ID=<client-id-oauth>
GOOGLE_CLIENT_SECRET=<secreto-oauth>
GOOGLE_REDIRECT_URI=<redirect-uri-del-cliente-oauth>
GOOGLE_REFRESH_TOKEN=<refresh-token-oauth>
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

`IntegracionMeetService` crea un evento en Google Calendar mediante OAuth2 y solicita una
conferencia de Google Meet. Configure las cuatro variables `GOOGLE_*` anteriores en el entorno
del API y habilite Google Calendar API en el proyecto de Google Cloud asociado al cliente OAuth.
El usuario que autorizó el `GOOGLE_REFRESH_TOKEN` debe tener un calendario principal accesible y
haber concedido el alcance `https://www.googleapis.com/auth/calendar.events` con acceso OAuth
offline. La API admite crear eventos con `conferenceDataVersion: 1`, y Google puede aprovisionar
la conferencia de forma asíncrona; el servicio espera la URL antes de guardar la sesión. Sin OAuth configurado, la creación
de la reunión responde con error y no persiste un enlace ficticio ni inicia una sesión local.

Docker Compose pasa las variables `GOOGLE_*` al contenedor; no incluya credenciales en el repositorio.

Para crear una videoconsulta, el enlace real se crea al pulsar Iniciar consulta si todavía no
existe, y se guarda en `videoconsultas.enlaceMeet` junto con el evento en `meetEventId`.
También se puede solicitar al crear la videoconsulta:
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

Este microservicio expone su prefijo en `/api/v1`; usa el puerto `3005` en su Compose independiente
y `3010` en el Compose principal para convivir con MS Multisucursal.
El seed del API Gateway registra los prefijos `/videoconsultas`, `/sesiones` y `/meet` con destino
`MS_TELEMEDICINA_URL` (por defecto `http://host.docker.internal:3005/api/v1`). Ejecute de nuevo el
seed del Gateway después de desplegar este cambio para registrar las rutas en su base de datos.
En el Compose principal este destino se define como `http://ms-telemedicina:3010/api/v1`.
