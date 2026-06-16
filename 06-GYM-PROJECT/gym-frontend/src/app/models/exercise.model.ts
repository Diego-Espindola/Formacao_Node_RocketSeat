export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateExerciseRequest {
  name: string;
  muscle_group: MuscleGroup;
}

export interface UpdateExerciseRequest {
  name?: string;
  muscle_group?: MuscleGroup;
}
