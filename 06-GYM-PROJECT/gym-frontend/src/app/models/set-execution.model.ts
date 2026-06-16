export type IntensityType = 'weight' | 'bodyweight' | 'time' | 'distance';

export interface SetExecution {
  id: string;
  exercise_execution_id: string;
  sequence: number;
  intensity_type: IntensityType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateSetExecutionRequest {
  exercise_execution_id: string;
  sequence: number;
  intensity_type: IntensityType;
}

export interface UpdateSetExecutionRequest {
  sequence?: number;
  intensity_type?: IntensityType;
}
