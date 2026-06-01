-- CreateTable
CREATE TABLE "videoconsultas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "duracionMinutos" INTEGER NOT NULL DEFAULT 30,
    "motivo" VARCHAR(500) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "meetLink" VARCHAR(500),
    "meetEventId" VARCHAR(255),
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER,

    CONSTRAINT "videoconsultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "notas" VARCHAR(2000),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "videoconsultaId" INTEGER,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_videoconsultaId_fkey"
  FOREIGN KEY ("videoconsultaId") REFERENCES "videoconsultas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
