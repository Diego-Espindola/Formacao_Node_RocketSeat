import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

import { ApiService } from '../core/services/api.service';
import {
  CreateSetExecutionRequest,
  SetExecution,
  UpdateSetExecutionRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class SetExecutionService extends ApiService {
  private readonly setsSignal = signal<SetExecution[]>([]);

  readonly sets = this.setsSignal.asReadonly();

  getByExerciseExecutionId(exerciseExecutionId: string) {
    return this.get<SetExecution[]>(
      `/exercise-executions/${exerciseExecutionId}/set-executions`,
    );
  }

  create(payload: CreateSetExecutionRequest) {
    return this.post<SetExecution, CreateSetExecutionRequest>(
      '/set-executions',
      payload,
    ).pipe(
      tap((setExecution) => {
        this.setsSignal.update((items) => [...items, setExecution]);
      }),
    );
  }

  update(id: string, payload: UpdateSetExecutionRequest) {
    return this.put<SetExecution, UpdateSetExecutionRequest>(
      `/set-executions/${id}`,
      payload,
    ).pipe(
      tap((setExecution) => {
        this.setsSignal.update((items) =>
          items.map((item) => (item.id === id ? setExecution : item)),
        );
      }),
    );
  }

  remove(id: string) {
    return this.delete<void>(`/set-executions/${id}`).pipe(
      tap(() => {
        this.setsSignal.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }
}
