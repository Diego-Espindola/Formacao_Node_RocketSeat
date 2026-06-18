import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

import { prisma, serialize, serializeExercise, serializeExercises, serializeMany, serializeWorkout, serializeWorkouts, workoutInclude } from './lib/prisma.js';

const PORT = 3377;

const app = express();
app.use(cors());
app.use(express.json());

const notDeleted = { deleted_at: null };

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, message: 'gym-backend top rodando' });
});

async function auth(req, res, next) {
  if (req.path === '/sessions' && req.method === 'POST') {
    return next();
  }

  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente. Faça login.' });
  }

  const token = header.slice(7);
  if (!token.startsWith('fake-jwt-')) {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  const userId = token.slice('fake-jwt-'.length);
  const user = await prisma.user.findFirst({
    where: { id: userId, ...notDeleted },
  });

  if (!user) {
    return res.status(401).json({ message: 'Usuário não encontrado.' });
  }

  req.user = user;
  return next();
}

app.use(auth);

app.post('/sessions', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  const user = await prisma.user.findFirst({
    where: { email, ...notDeleted },
  });

  if (!user) {
    return res.status(401).json({ message: 'E-mail não cadastrado.' });
  }

  return res.json({
    token: `fake-jwt-${user.id}`,
    user: serialize(user),
  });
});

app.get('/muscle-groups', async (_req, res) => {
  const muscleGroups = await prisma.muscleGroup.findMany({
    where: notDeleted,
    orderBy: { label: 'asc' },
  });
  res.json(serializeMany(muscleGroups));
});

app.get('/exercises', async (_req, res) => {
  const exercises = await prisma.exercise.findMany({
    where: notDeleted,
    include: { muscle_group: true },
    orderBy: { name: 'asc' },
  });
  res.json(serializeExercises(exercises));
});

app.get('/exercises/:id', async (req, res) => {
  const exercise = await prisma.exercise.findFirst({
    where: { id: req.params.id, ...notDeleted },
    include: { muscle_group: true },
  });

  if (!exercise) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }

  res.json(serializeExercise(exercise));
});

app.post('/exercises', async (req, res) => {
  const { name, muscle_group } = req.body ?? {};

  if (!name || !muscle_group) {
    return res.status(400).json({ message: 'name e muscle_group são obrigatórios.' });
  }

  const group = await prisma.muscleGroup.findFirst({
    where: { id: muscle_group, ...notDeleted },
  });

  if (!group) {
    return res.status(400).json({ message: 'Grupo muscular inválido.' });
  }

  const exercise = await prisma.exercise.create({
    data: {
      id: randomUUID(),
      name,
      muscle_group_id: muscle_group,
      created_by: req.user.id,
    },
    include: { muscle_group: true },
  });

  res.status(201).json(serializeExercise(exercise));
});

app.put('/exercises/:id', async (req, res) => {
  const existing = await prisma.exercise.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }

  if (req.body.muscle_group) {
    const group = await prisma.muscleGroup.findFirst({
      where: { id: req.body.muscle_group, ...notDeleted },
    });

    if (!group) {
      return res.status(400).json({ message: 'Grupo muscular inválido.' });
    }
  }

  const exercise = await prisma.exercise.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name ? { name: req.body.name } : {}),
      ...(req.body.muscle_group ? { muscle_group_id: req.body.muscle_group } : {}),
    },
    include: { muscle_group: true },
  });

  res.json(serializeExercise(exercise));
});

app.delete('/exercises/:id', async (req, res) => {
  const existing = await prisma.exercise.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }

  await prisma.exercise.update({
    where: { id: req.params.id },
    data: { deleted_at: new Date() },
  });

  res.status(204).send();
});

const BLOCK_TYPES = new Set(['SINGLE', 'BI_SET', 'TRI_SET', 'CIRCUIT']);

async function validateExerciseIds(exerciseIds) {
  const uniqueIds = [...new Set(exerciseIds)];
  if (!uniqueIds.length) {
    return true;
  }

  const count = await prisma.exercise.count({
    where: { id: { in: uniqueIds }, ...notDeleted },
  });

  return count === uniqueIds.length;
}

function collectExerciseIds(blocks) {
  return (blocks ?? []).flatMap((block) =>
    (block.exercises ?? []).map((exercise) => exercise.exercise_id),
  );
}

function validateBlocks(blocks) {
  if (!blocks?.length) {
    return null;
  }

  for (const block of blocks) {
    if (block.sequence == null) {
      return 'Cada bloco precisa de sequence.';
    }

    if (block.block_type && !BLOCK_TYPES.has(block.block_type)) {
      return `block_type inválido: ${block.block_type}.`;
    }

    for (const exercise of block.exercises ?? []) {
      if (!exercise.exercise_id || exercise.sequence == null) {
        return 'Cada exercício precisa de exercise_id e sequence.';
      }

      for (const set of exercise.sets ?? []) {
        if (set.sequence == null) {
          return 'Cada série precisa de sequence.';
        }
      }
    }
  }

  return null;
}

async function createWorkoutBlocks(tx, workoutId, blocks) {
  for (const block of blocks ?? []) {
    const workoutBlock = await tx.workoutBlock.create({
      data: {
        id: randomUUID(),
        workout_id: workoutId,
        sequence: block.sequence,
        block_type: block.block_type ?? 'SINGLE',
        notes: block.notes ?? null,
      },
    });

    for (const exercise of block.exercises ?? []) {
      const workoutExercise = await tx.workoutExercise.create({
        data: {
          id: randomUUID(),
          workout_block_id: workoutBlock.id,
          exercise_id: exercise.exercise_id,
          sequence: exercise.sequence,
          notes: exercise.notes ?? null,
        },
      });

      for (const set of exercise.sets ?? []) {
        await tx.exerciseSet.create({
          data: {
            id: randomUUID(),
            workout_exercise_id: workoutExercise.id,
            sequence: set.sequence,
            reps: set.reps ?? null,
            weight: set.weight ?? null,
            duration_seconds: set.duration_seconds ?? null,
            distance: set.distance ?? null,
            intensity_type: set.intensity_type ?? 'REGULAR',
          },
        });
      }
    }
  }
}

async function findWorkoutForUser(id, userId) {
  return prisma.workout.findFirst({
    where: { id, user_id: userId },
    include: workoutInclude,
  });
}

app.get('/workouts', async (req, res) => {
  const { is_template } = req.query;
  const where = { user_id: req.user.id };

  if (is_template === 'true') {
    where.is_template = true;
  } else if (is_template === 'false') {
    where.is_template = false;
  }

  const workouts = await prisma.workout.findMany({
    where,
    include: workoutInclude,
    orderBy: [{ executed_at: 'desc' }, { created_at: 'desc' }],
  });

  res.json(serializeWorkouts(workouts));
});

app.get('/workouts/:id', async (req, res) => {
  const workout = await findWorkoutForUser(req.params.id, req.user.id);

  if (!workout) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  res.json(serializeWorkout(workout));
});

app.post('/workouts', async (req, res) => {
  const { name, notes, is_template, executed_at, blocks } = req.body ?? {};
  const validationError = validateBlocks(blocks);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const exerciseIds = collectExerciseIds(blocks);
  if (!(await validateExerciseIds(exerciseIds))) {
    return res.status(400).json({ message: 'Um ou mais exercícios são inválidos.' });
  }

  const workoutId = await prisma.$transaction(async (tx) => {
    const workout = await tx.workout.create({
      data: {
        id: randomUUID(),
        user_id: req.user.id,
        name: name ?? null,
        notes: notes ?? null,
        is_template: is_template ?? false,
        executed_at: executed_at ? new Date(executed_at) : null,
      },
    });

    await createWorkoutBlocks(tx, workout.id, blocks);
    return workout.id;
  });

  const workout = await findWorkoutForUser(workoutId, req.user.id);
  res.status(201).json(serializeWorkout(workout));
});

app.put('/workouts/:id', async (req, res) => {
  const existing = await prisma.workout.findFirst({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  const { name, notes, is_template, executed_at, blocks } = req.body ?? {};

  if (blocks) {
    const validationError = validateBlocks(blocks);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const exerciseIds = collectExerciseIds(blocks);
    if (!(await validateExerciseIds(exerciseIds))) {
      return res.status(400).json({ message: 'Um ou mais exercícios são inválidos.' });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id: req.params.id },
      data: {
        ...('name' in req.body ? { name: name ?? null } : {}),
        ...('notes' in req.body ? { notes: notes ?? null } : {}),
        ...('is_template' in req.body ? { is_template: is_template ?? false } : {}),
        ...('executed_at' in req.body
          ? { executed_at: executed_at ? new Date(executed_at) : null }
          : {}),
      },
    });

    if (blocks) {
      await tx.workoutBlock.deleteMany({ where: { workout_id: req.params.id } });
      await createWorkoutBlocks(tx, req.params.id, blocks);
    }
  });

  const workout = await findWorkoutForUser(req.params.id, req.user.id);
  res.json(serializeWorkout(workout));
});

app.delete('/workouts/:id', async (req, res) => {
  const existing = await prisma.workout.findFirst({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  await prisma.workout.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`🏋️ gym-backend top em http://localhost:${PORT}`);
  console.log('Login: use um e-mail cadastrado no seed.json');
});
