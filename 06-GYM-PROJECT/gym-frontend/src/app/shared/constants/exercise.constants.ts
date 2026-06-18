import { MuscleGroup } from '../../models';

export const MUSCLE_GROUP_OPTIONS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Peito' },
  { value: 'back', label: 'Costas' },
  { value: 'shoulders', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'legs', label: 'Pernas' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Corpo inteiro' },
  { value: 'other', label: 'Outro' },
];

export function formatMuscleGroup(group: MuscleGroup): string {
  return MUSCLE_GROUP_OPTIONS.find((option) => option.value === group)?.label ?? group;
}
