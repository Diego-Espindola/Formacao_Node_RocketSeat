import fs from 'node:fs';

import { requireEnv } from '../src/lib/env.js';
import { parseDates, prisma } from '../src/lib/prisma.js';

const SEED_PATH = requireEnv('SEED_PATH');

async function isDatabaseEmpty() {
  const count = await prisma.exercise.count();
  return count === 0;
}

async function importSeed() {
  if (!fs.existsSync(SEED_PATH)) {
    console.log(`[seed] Arquivo não encontrado: ${SEED_PATH}`);
    return;
  }

  if (!(await isDatabaseEmpty())) {
    console.log('[seed] Banco já tem dados — import ignorado.');
    return;
  }

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));

  await prisma.$transaction(async (tx) => {
    if (seed.users?.length) {
      await tx.user.createMany({ data: seed.users.map(parseDates) });
    }

    if (seed.exercises?.length) {
      await tx.exercise.createMany({ data: seed.exercises.map(parseDates) });
    }

    if (seed.exercise_executions?.length) {
      await tx.exerciseExecution.createMany({
        data: seed.exercise_executions.map(parseDates),
      });
    }

    if (seed.set_executions?.length) {
      await tx.setExecution.createMany({ data: seed.set_executions.map(parseDates) });
    }

    if (seed.set_informations?.length) {
      await tx.setInformation.createMany({ data: seed.set_informations.map(parseDates) });
    }
  });

  console.log(`[seed] Importado de ${SEED_PATH}`);
}

importSeed()
  .catch((error) => {
    console.error('[seed] Falha no import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
