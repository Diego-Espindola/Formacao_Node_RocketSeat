import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

import { prisma, serialize, serializeExercise, serializeExercises, serializeMany } from './lib/prisma.js';

const PORT = 3377;

const app = express();
app.use(cors());
app.use(express.json());

const notDeleted = { deleted_at: null };

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, message: 'gym-backend xulo rodando' });
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

  let user = await prisma.user.findFirst({
    where: { email, ...notDeleted },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: email.split('@')[0],
        email,
      },
    });
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

app.get('/exercise-executions', async (_req, res) => {
  const executions = await prisma.exerciseExecution.findMany({
    where: notDeleted,
    orderBy: { executed_at: 'desc' },
  });
  res.json(serializeMany(executions));
});

app.get('/exercise-executions/:id', async (req, res) => {
  const execution = await prisma.exerciseExecution.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!execution) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }

  res.json(serialize(execution));
});

app.post('/exercise-executions', async (req, res) => {
  const { exercise_id, executed_at, notes } = req.body ?? {};

  if (!exercise_id) {
    return res.status(400).json({ message: 'exercise_id é obrigatório.' });
  }

  const execution = await prisma.exerciseExecution.create({
    data: {
      id: randomUUID(),
      user_id: req.user.id,
      exercise_id,
      executed_at: executed_at ? new Date(executed_at) : new Date(),
      notes: notes ?? null,
    },
  });

  res.status(201).json(serialize(execution));
});

app.put('/exercise-executions/:id', async (req, res) => {
  const existing = await prisma.exerciseExecution.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }

  const execution = await prisma.exerciseExecution.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.executed_at ? { executed_at: new Date(req.body.executed_at) } : {}),
      ...('notes' in req.body ? { notes: req.body.notes } : {}),
    },
  });

  res.json(serialize(execution));
});

app.delete('/exercise-executions/:id', async (req, res) => {
  const existing = await prisma.exerciseExecution.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }

  await prisma.exerciseExecution.update({
    where: { id: req.params.id },
    data: { deleted_at: new Date() },
  });

  res.status(204).send();
});

app.get('/exercise-executions/:id/set-executions', async (req, res) => {
  const sets = await prisma.setExecution.findMany({
    where: { exercise_execution_id: req.params.id, ...notDeleted },
    orderBy: { sequence: 'asc' },
  });
  res.json(serializeMany(sets));
});

app.post('/set-executions', async (req, res) => {
  const { exercise_execution_id, sequence, intensity_type } = req.body ?? {};

  if (!exercise_execution_id || sequence == null || !intensity_type) {
    return res.status(400).json({
      message: 'exercise_execution_id, sequence e intensity_type são obrigatórios.',
    });
  }

  const setExecution = await prisma.setExecution.create({
    data: {
      id: randomUUID(),
      exercise_execution_id,
      sequence,
      intensity_type,
    },
  });

  res.status(201).json(serialize(setExecution));
});

app.put('/set-executions/:id', async (req, res) => {
  const existing = await prisma.setExecution.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Série não encontrada.' });
  }

  const setExecution = await prisma.setExecution.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.sequence != null ? { sequence: req.body.sequence } : {}),
      ...(req.body.intensity_type ? { intensity_type: req.body.intensity_type } : {}),
    },
  });

  res.json(serialize(setExecution));
});

app.delete('/set-executions/:id', async (req, res) => {
  const existing = await prisma.setExecution.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Série não encontrada.' });
  }

  await prisma.setExecution.update({
    where: { id: req.params.id },
    data: { deleted_at: new Date() },
  });

  res.status(204).send();
});

app.get('/set-executions/:id/set-informations', async (req, res) => {
  const infos = await prisma.setInformation.findMany({
    where: { set_execution_id: req.params.id, ...notDeleted },
  });
  res.json(serializeMany(infos));
});

app.post('/set-informations', async (req, res) => {
  const { set_execution_id, reps, weight, duration_seconds, distance } = req.body ?? {};

  if (!set_execution_id) {
    return res.status(400).json({ message: 'set_execution_id é obrigatório.' });
  }

  const info = await prisma.setInformation.create({
    data: {
      id: randomUUID(),
      set_execution_id,
      reps: reps ?? null,
      weight: weight ?? null,
      duration_seconds: duration_seconds ?? null,
      distance: distance ?? null,
    },
  });

  res.status(201).json(serialize(info));
});

app.put('/set-informations/:id', async (req, res) => {
  const existing = await prisma.setInformation.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Informação não encontrada.' });
  }

  const info = await prisma.setInformation.update({
    where: { id: req.params.id },
    data: {
      ...('reps' in req.body ? { reps: req.body.reps } : {}),
      ...('weight' in req.body ? { weight: req.body.weight } : {}),
      ...('duration_seconds' in req.body ? { duration_seconds: req.body.duration_seconds } : {}),
      ...('distance' in req.body ? { distance: req.body.distance } : {}),
    },
  });

  res.json(serialize(info));
});

app.delete('/set-informations/:id', async (req, res) => {
  const existing = await prisma.setInformation.findFirst({
    where: { id: req.params.id, ...notDeleted },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Informação não encontrada.' });
  }

  await prisma.setInformation.update({
    where: { id: req.params.id },
    data: { deleted_at: new Date() },
  });

  res.status(204).send();
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`🏋️ gym-backend xulo em http://localhost:${PORT}`);
  console.log('Login: qualquer e-mail/senha funciona');
});
