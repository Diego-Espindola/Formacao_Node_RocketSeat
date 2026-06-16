import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

import { ApiService } from '../core/services/api.service';
import {
  CreateExerciseExecutionRequest,
  ExerciseExecution,
  UpdateExerciseExecutionRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExerciseExecutionService extends ApiService {
  private readonly executionsSignal = signal<ExerciseExecution[]>([]);
  private readonly loadingSignal = signal(false);

  readonly executions = this.executionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadAll() {
    this.loadingSignal.set(true);

    return this.get<ExerciseExecution[]>('/exercise-executions').pipe(
      tap({
        next: (executions) => {
          this.executionsSignal.set(executions);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false),
      }),
    );
  }

  getById(id: string) {
    return this.get<ExerciseExecution>(`/exercise-executions/${id}`);
  }

  create(payload: CreateExerciseExecutionRequest) {
    return this.post<ExerciseExecution, CreateExerciseExecutionRequest>(
      '/exercise-executions',
      payload,
    ).pipe(
      tap((execution) => {
        this.executionsSignal.update((items) => [...items, execution]);
      }),
    );
  }

  update(id: string, payload: UpdateExerciseExecutionRequest) {
    return this.put<ExerciseExecution, UpdateExerciseExecutionRequest>(
      `/exercise-executions/${id}`,
      payload,
    ).pipe(
      tap((execution) => {
        this.executionsSignal.update((items) =>
          items.map((item) => (item.id === id ? execution : item)),
        );
      }),
    );
  }

  remove(id: string) {
    return this.delete<void>(`/exercise-executions/${id}`).pipe(
      tap(() => {
        this.executionsSignal.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }
}
