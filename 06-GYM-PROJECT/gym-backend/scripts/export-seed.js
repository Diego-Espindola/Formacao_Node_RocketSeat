import fs from 'node:fs';
import path from 'node:path';

import { requireEnv } from '../src/lib/env.js';
import { prisma, serializeMany } from '../src/lib/prisma.js';

const SEED_PATH = requireEnv('SEED_PATH');

async function exportSeed() {
  const [users, exercises, workouts, workout_blocks, workout_exercises, exercise_sets] =
    await Promise.all([
      prisma.user.findMany(),
      prisma.exercise.findMany(),
      prisma.workout.findMany(),
      prisma.workoutBlock.findMany(),
      prisma.workoutExercise.findMany(),
      prisma.exerciseSet.findMany(),
    ]);

  const seed = {
    users: serializeMany(users),
    exercises: serializeMany(exercises),
    workouts: serializeMany(workouts),
    workout_blocks: serializeMany(workout_blocks),
    workout_exercises: serializeMany(workout_exercises),
    exercise_sets: serializeMany(exercise_sets),
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
