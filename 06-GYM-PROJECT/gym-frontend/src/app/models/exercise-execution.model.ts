export interface ExerciseExecution {
  id: string;
  user_id: string;
  exercise_id: string;
  executed_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateExerciseExecutionRequest {
  exercise_id: string;
  executed_at?: string;
  notes?: string | null;
}

export interface UpdateExerciseExecutionRequest {
  executed_at?: string;
  notes?: string | null;
}
