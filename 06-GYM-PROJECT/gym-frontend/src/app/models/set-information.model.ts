export interface SetInformation {
  id: string;
  set_execution_id: string;
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  distance: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateSetInformationRequest {
  set_execution_id: string;
  reps?: number | null;
  weight?: number | null;
  duration_seconds?: number | null;
  distance?: number | null;
}

export interface UpdateSetInformationRequest {
  reps?: number | null;
  weight?: number | null;
  duration_seconds?: number | null;
  distance?: number | null;
}
