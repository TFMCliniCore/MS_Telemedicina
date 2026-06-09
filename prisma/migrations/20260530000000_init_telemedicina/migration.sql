
-- CreateTable videoconsultas
CREATE TABLE "videoconsultas" (
    "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
    "fecha"           TIMESTAMP(3) NOT NULL,
    "duracionMinutos" INTEGER      NOT NULL DEFAULT 30,
    "motivo"          VARCHAR(500) NOT NULL,
    "estado"          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    "eliminado"       BOOLEAN      NOT NULL DEFAULT false,
    "enlaceMeet"      VARCHAR(500),
    "meetEventId"     VARCHAR(255),
    "pacienteId"      UUID         NOT NULL,
    "clienteId"       UUID         NOT NULL,
    "doctorId"        UUID,
    "especialidadId"  UUID,
    "usuarioId"       UUID,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "videoconsultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable sesiones
CREATE TABLE "sesiones" (
    "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
    "horaInicio"      TIMESTAMP(3),
    "horaFin"         TIMESTAMP(3),
    "notas"           VARCHAR(2000),
    "grabacionUrl"    VARCHAR(500),
    "estado"          VARCHAR(20)   NOT NULL DEFAULT 'ACTIVA',
    "eliminado"       BOOLEAN       NOT NULL DEFAULT false,
    "pacienteId"      UUID          NOT NULL,
    "clienteId"       UUID          NOT NULL,
    "usuarioId"       UUID,
    "videoconsultaId" UUID,
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable participantes
CREATE TABLE "participantes" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "sesionId"      UUID         NOT NULL,
    "usuarioId"     UUID         NOT NULL,
    "rol"           VARCHAR(50)  NOT NULL,
    "conectado"     BOOLEAN      NOT NULL DEFAULT false,
    "fechaConexion" TIMESTAMP(3),
    "eliminado"     BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey sesiones → videoconsultas
ALTER TABLE "sesiones"
  ADD CONSTRAINT "sesiones_videoconsultaId_fkey"
  FOREIGN KEY ("videoconsultaId") REFERENCES "videoconsultas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey participantes → sesiones
ALTER TABLE "participantes"
  ADD CONSTRAINT "participantes_sesionId_fkey"
  FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;