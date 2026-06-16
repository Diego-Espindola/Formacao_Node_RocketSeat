import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

const PORT = 3377;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'gym-backend xulo rodando' });
});

// --- helpers bem xulos ---

function now() {
  return new Date().toISOString();
}

function timestamps() {
  const t = now();
  return { created_at: t, updated_at: t, deleted_at: null };
}

function touch(entity) {
  entity.updated_at = now();
  return entity;
}

function notDeleted(items) {
  return items.filter((item) => !item.deleted_at);
}

// usuário fake fixo
const FAKE_USER = {
  id: 'user-1',
  name: 'Diego Teste',
  email: 'teste@gym.com',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  deleted_at: null,
};

// "banco" em memória
const db = {
  exercises: [
    {
      id: 'ex-1',
      name: 'Supino reto',
      muscle_group: 'chest',
      created_by: null,
      ...timestamps(),
    },
    {
      id: 'ex-2',
      name: 'Agachamento livre',
      muscle_group: 'legs',
      created_by: null,
      ...timestamps(),
    },
    {
      id: 'ex-3',
      name: 'Remada curvada',
      muscle_group: 'back',
      created_by: null,
      ...timestamps(),
    },
    {
      id: 'ex-4',
      name: 'Desenvolvimento com halteres',
      muscle_group: 'shoulders',
      created_by: null,
      ...timestamps(),
    },
  ],
  exerciseExecutions: [],
  setExecutions: [],
  setInformations: [],
};

function auth(req, res, next) {
  if (req.path === '/sessions' && req.method === 'POST') {
    return next();
  }

  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente. Faça login.' });
  }

  req.user = FAKE_USER;
  next();
}

app.use(auth);

// --- auth ---

app.post('/sessions', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  // qualquer login funciona nesse mock :)
  return res.json({
    token: `fake-jwt-${randomUUID()}`,
    user: { ...FAKE_USER, email },
  });
});

// --- exercises ---

app.get('/exercises', (_req, res) => {
  res.json(notDeleted(db.exercises));
});

app.get('/exercises/:id', (req, res) => {
  const exercise = notDeleted(db.exercises).find((item) => item.id === req.params.id);
  if (!exercise) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }
  res.json(exercise);
});

app.post('/exercises', (req, res) => {
  const { name, muscle_group } = req.body ?? {};

  if (!name || !muscle_group) {
    return res.status(400).json({ message: 'name e muscle_group são obrigatórios.' });
  }

  const exercise = {
    id: randomUUID(),
    name,
    muscle_group,
    created_by: req.user.id,
    ...timestamps(),
  };

  db.exercises.push(exercise);
  res.status(201).json(exercise);
});

app.put('/exercises/:id', (req, res) => {
  const exercise = db.exercises.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!exercise) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }

  if (req.body.name) exercise.name = req.body.name;
  if (req.body.muscle_group) exercise.muscle_group = req.body.muscle_group;
  touch(exercise);

  res.json(exercise);
});

app.delete('/exercises/:id', (req, res) => {
  const exercise = db.exercises.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!exercise) {
    return res.status(404).json({ message: 'Exercício não encontrado.' });
  }

  exercise.deleted_at = now();
  touch(exercise);
  res.status(204).send();
});

// --- exercise executions ---

app.get('/exercise-executions', (_req, res) => {
  res.json(notDeleted(db.exerciseExecutions));
});

app.get('/exercise-executions/:id', (req, res) => {
  const execution = notDeleted(db.exerciseExecutions).find((item) => item.id === req.params.id);
  if (!execution) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }
  res.json(execution);
});

app.post('/exercise-executions', (req, res) => {
  const { exercise_id, executed_at, notes } = req.body ?? {};

  if (!exercise_id) {
    return res.status(400).json({ message: 'exercise_id é obrigatório.' });
  }

  const execution = {
    id: randomUUID(),
    user_id: req.user.id,
    exercise_id,
    executed_at: executed_at ?? now(),
    notes: notes ?? null,
    ...timestamps(),
  };

  db.exerciseExecutions.push(execution);
  res.status(201).json(execution);
});

app.put('/exercise-executions/:id', (req, res) => {
  const execution = db.exerciseExecutions.find(
    (item) => item.id === req.params.id && !item.deleted_at,
  );
  if (!execution) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }

  if (req.body.executed_at) execution.executed_at = req.body.executed_at;
  if ('notes' in req.body) execution.notes = req.body.notes;
  touch(execution);

  res.json(execution);
});

app.delete('/exercise-executions/:id', (req, res) => {
  const execution = db.exerciseExecutions.find(
    (item) => item.id === req.params.id && !item.deleted_at,
  );
  if (!execution) {
    return res.status(404).json({ message: 'Execução não encontrada.' });
  }

  execution.deleted_at = now();
  touch(execution);
  res.status(204).send();
});

// --- set executions ---

app.get('/exercise-executions/:id/set-executions', (req, res) => {
  const sets = notDeleted(db.setExecutions)
    .filter((item) => item.exercise_execution_id === req.params.id)
    .sort((a, b) => a.sequence - b.sequence);

  res.json(sets);
});

app.post('/set-executions', (req, res) => {
  const { exercise_execution_id, sequence, intensity_type } = req.body ?? {};

  if (!exercise_execution_id || sequence == null || !intensity_type) {
    return res.status(400).json({
      message: 'exercise_execution_id, sequence e intensity_type são obrigatórios.',
    });
  }

  const setExecution = {
    id: randomUUID(),
    exercise_execution_id,
    sequence,
    intensity_type,
    ...timestamps(),
  };

  db.setExecutions.push(setExecution);
  res.status(201).json(setExecution);
});

app.put('/set-executions/:id', (req, res) => {
  const setExecution = db.setExecutions.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!setExecution) {
    return res.status(404).json({ message: 'Série não encontrada.' });
  }

  if (req.body.sequence != null) setExecution.sequence = req.body.sequence;
  if (req.body.intensity_type) setExecution.intensity_type = req.body.intensity_type;
  touch(setExecution);

  res.json(setExecution);
});

app.delete('/set-executions/:id', (req, res) => {
  const setExecution = db.setExecutions.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!setExecution) {
    return res.status(404).json({ message: 'Série não encontrada.' });
  }

  setExecution.deleted_at = now();
  touch(setExecution);
  res.status(204).send();
});

// --- set informations ---

app.get('/set-executions/:id/set-informations', (req, res) => {
  const infos = notDeleted(db.setInformations).filter(
    (item) => item.set_execution_id === req.params.id,
  );

  res.json(infos);
});

app.post('/set-informations', (req, res) => {
  const { set_execution_id, reps, weight, duration_seconds, distance } = req.body ?? {};

  if (!set_execution_id) {
    return res.status(400).json({ message: 'set_execution_id é obrigatório.' });
  }

  const info = {
    id: randomUUID(),
    set_execution_id,
    reps: reps ?? null,
    weight: weight ?? null,
    duration_seconds: duration_seconds ?? null,
    distance: distance ?? null,
    ...timestamps(),
  };

  db.setInformations.push(info);
  res.status(201).json(info);
});

app.put('/set-informations/:id', (req, res) => {
  const info = db.setInformations.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!info) {
    return res.status(404).json({ message: 'Informação não encontrada.' });
  }

  if ('reps' in req.body) info.reps = req.body.reps;
  if ('weight' in req.body) info.weight = req.body.weight;
  if ('duration_seconds' in req.body) info.duration_seconds = req.body.duration_seconds;
  if ('distance' in req.body) info.distance = req.body.distance;
  touch(info);

  res.json(info);
});

app.delete('/set-informations/:id', (req, res) => {
  const info = db.setInformations.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!info) {
    return res.status(404).json({ message: 'Informação não encontrada.' });
  }

  info.deleted_at = now();
  touch(info);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🏋️ gym-backend xulo em http://localhost:${PORT}`);
  console.log('Login: qualquer e-mail/senha funciona');
});
