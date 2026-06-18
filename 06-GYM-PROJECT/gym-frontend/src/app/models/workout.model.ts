import { Exercise } from './exercise.model';

export type BlockType = 'SINGLE' | 'BI_SET' | 'TRI_SET' | 'CIRCUIT';
export type IntensityType = 'REGULAR' | 'DROP_SET' | 'REST_PAUSE' | 'CLUSTER';

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  sequence: number;
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  distance: number | null;
  intensity_type: string | null;
  created_at: string;
}

export interface CreateExerciseSetRequest {
  sequence: number;
  reps?: number | null;
  weight?: number | null;
  duration_seconds?: number | null;
  distance?: number | null;
  intensity_type?: IntensityType | string | null;
}

export interface CreateWorkoutExerciseRequest {
  exercise_id: string;
  sequence: number;
  notes?: string | null;
  sets: CreateExerciseSetRequest[];
}

export interface CreateWorkoutBlockRequest {
  sequence: number;
  block_type?: BlockType | string;
  notes?: string | null;
  exercises: CreateWorkoutExerciseRequest[];
}

export interface CreateWorkoutRequest {
  name?: string | null;
  notes?: string | null;
  is_template?: boolean;
  executed_at?: string | null;
  blocks: CreateWorkoutBlockRequest[];
}

export interface WorkoutExercise {
  id: string;
  workout_block_id: string;
  exercise_id: string;
  sequence: number;
  notes: string | null;
  exercise?: Exercise;
  sets: ExerciseSet[];
}

export interface WorkoutBlock {
  id: string;
  workout_id: string;
  sequence: number;
  block_type: BlockType | string;
  notes: string | null;
  exercises: WorkoutExercise[];
}

export interface Workout {
  id: string;
  user_id: string;
  name: string | null;
  notes: string | null;
  is_template: boolean;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
  blocks: WorkoutBlock[];
}
