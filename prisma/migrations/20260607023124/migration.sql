/*
  Warnings:

  - The primary key for the `participantes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sesiones` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `videoconsultas` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "participantes" DROP CONSTRAINT "participantes_sesionId_fkey";

-- DropForeignKey
ALTER TABLE "sesiones" DROP CONSTRAINT "sesiones_videoconsultaId_fkey";

-- AlterTable
ALTER TABLE "participantes" DROP CONSTRAINT "participantes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sesionId" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "participantes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sesiones" DROP CONSTRAINT "sesiones_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pacienteId" SET DATA TYPE TEXT,
ALTER COLUMN "clienteId" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ALTER COLUMN "videoconsultaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "videoconsultas" DROP CONSTRAINT "videoconsultas_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pacienteId" SET DATA TYPE TEXT,
ALTER COLUMN "clienteId" SET DATA TYPE TEXT,
ALTER COLUMN "doctorId" SET DATA TYPE TEXT,
ALTER COLUMN "especialidadId" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "videoconsultas_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_videoconsultaId_fkey" FOREIGN KEY ("videoconsultaId") REFERENCES "videoconsultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
