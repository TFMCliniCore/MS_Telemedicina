const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MS_Telemedicina...');

  await prisma.videoconsulta.createMany({
    data: [
      {
        fecha: new Date('2026-06-01T10:00:00Z'),
        duracionMinutos: 30,
        motivo: 'Control post-operatorio',
        estado: 'PENDIENTE',
        pacienteId: 1,
        clienteId: 1,
        usuarioId: 1,
      },
      {
        fecha: new Date('2026-06-02T14:00:00Z'),
        duracionMinutos: 45,
        motivo: 'Seguimiento tratamiento',
        estado: 'PENDIENTE',
        pacienteId: 2,
        clienteId: 1,
        usuarioId: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
