import fs from 'node:fs';
import path from 'node:path';

import { requireEnv } from '../src/lib/env.js';
import { prisma, serializeMany } from '../src/lib/prisma.js';

const SEED_PATH = requireEnv('SEED_PATH');

async function exportSeed() {
  const [users, exercises, exercise_executions, set_executions, set_informations] =
    await Promise.all([
      prisma.user.findMany(),
      prisma.exercise.findMany(),
      prisma.exerciseExecution.findMany(),
      prisma.setExecution.findMany(),
      prisma.setInformation.findMany(),
    ]);

  const seed = {
    users: serializeMany(users),
    exercises: serializeMany(exercises),
    exercise_executions: serializeMany(exercise_executions),
    set_executions: serializeMany(set_executions),
    set_informations: serializeMany(set_informations),
  };

  fs.mkdirSync(path.dirname(SEED_PATH), { recursive: true });
  fs.writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`);

  console.log(`[seed] Exportado para ${SEED_PATH}`);
}

exportSeed()
  .catch((error) => {
    console.error('[seed] Falha no export:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
