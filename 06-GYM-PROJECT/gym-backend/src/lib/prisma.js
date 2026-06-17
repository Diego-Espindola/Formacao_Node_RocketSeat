import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

import { requireEnv } from './env.js';

const adapter = new PrismaPg({
  connectionString: requireEnv('DATABASE_URL'),
});

const prisma = new PrismaClient({ adapter });

const DATE_FIELDS = ['created_at', 'updated_at', 'deleted_at', 'executed_at'];

export function parseDates(record) {
  const parsed = { ...record };

  for (const field of DATE_FIELDS) {
    if (field in parsed && parsed[field] != null) {
      parsed[field] = new Date(parsed[field]);
    }
  }

  return parsed;
}

export function serialize(record) {
  if (!record) {
    return record;
  }

  const serialized = { ...record };

  for (const field of DATE_FIELDS) {
    if (serialized[field] instanceof Date) {
      serialized[field] = serialized[field].toISOString();
    }
  }

  return serialized;
}

export function serializeMany(records) {
  return records.map(serialize);
}

export function serializeExercise(record) {
  const { muscle_group_id, muscle_group, ...rest } = record;

  return serialize({
    ...rest,
    muscle_group: muscle_group?.id ?? muscle_group_id,
  });
}

export function serializeExercises(records) {
  return records.map(serializeExercise);
}

export { prisma };
