import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

import { ApiService } from '../core/services/api.service';
import { CreateWorkoutRequest, Workout } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService extends ApiService {
  private readonly workoutsSignal = signal<Workout[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly workouts = this.workoutsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadExecutedWorkouts() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.get<Workout[]>('/workouts?is_template=false').pipe(
      tap({
        next: (workouts) => {
          this.workoutsSignal.set(workouts);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Não foi possível carregar o histórico de treinos.');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  create(payload: CreateWorkoutRequest) {
    return this.post<Workout, CreateWorkoutRequest>('/workouts', payload).pipe(
      tap((workout) => {
        if (!workout.is_template) {
          this.workoutsSignal.update((items) => [workout, ...items]);
        }
      }),
    );
  }

  getById(id: string) {
    return this.get<Workout>(`/workouts/${id}`);
  }
}
