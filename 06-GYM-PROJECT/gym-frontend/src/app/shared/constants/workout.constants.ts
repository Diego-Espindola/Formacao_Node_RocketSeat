import { ExerciseSet, IntensityType, Workout } from '../../models';

export const INTENSITY_TYPE_OPTIONS: { value: IntensityType; label: string }[] = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'DROP_SET', label: 'Drop-set' },
  { value: 'REST_PAUSE', label: 'Rest-pause' },
  { value: 'CLUSTER', label: 'Cluster' },
];

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Exercício isolado',
  BI_SET: 'Bi-set',
  TRI_SET: 'Tri-set',
  CIRCUIT: 'Circuito',
};

export function formatBlockType(type: string): string {
  return BLOCK_TYPE_LABELS[type] ?? type;
}

export function formatIntensityType(type: string | null): string {
  if (!type || type === 'REGULAR') {
    return 'Regular';
  }

  return INTENSITY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function inferBlockType(exerciseCount: number): string {
  if (exerciseCount <= 1) {
    return 'SINGLE';
  }

  if (exerciseCount === 2) {
    return 'BI_SET';
  }

  if (exerciseCount === 3) {
    return 'TRI_SET';
  }

  return 'CIRCUIT';
}

export function formatExecutedAt(isoDate: string | null): string {
  if (!isoDate) {
    return 'Data não informada';
  }

  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function countWorkoutExercises(workout: Workout): number {
  return workout.blocks.reduce((total, block) => total + block.exercises.length, 0);
}

export function countWorkoutSets(workout: Workout): number {
  return workout.blocks.reduce(
    (total, block) =>
      total + block.exercises.reduce((setTotal, exercise) => setTotal + exercise.sets.length, 0),
    0,
  );
}

export function formatSetSummary(set: ExerciseSet): string {
  const parts: string[] = [];

  if (set.reps != null && set.weight != null) {
    parts.push(`${set.reps} reps @ ${set.weight} kg`);
  } else if (set.reps != null) {
    parts.push(`${set.reps} reps`);
  } else if (set.weight != null) {
    parts.push(`${set.weight} kg`);
  }

  if (set.duration_seconds != null) {
    parts.push(`${set.duration_seconds}s`);
  }

  if (set.distance != null) {
    parts.push(`${set.distance} km`);
  }

  if (set.intensity_type && set.intensity_type !== 'REGULAR') {
    parts.push(set.intensity_type);
  }

  return parts.length ? parts.join(' · ') : 'Série sem dados';
}
