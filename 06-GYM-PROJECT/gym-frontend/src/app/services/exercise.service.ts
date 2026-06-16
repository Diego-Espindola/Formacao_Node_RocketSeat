import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

import { ApiService } from '../core/services/api.service';
import {
  CreateExerciseRequest,
  Exercise,
  MuscleGroup,
  UpdateExerciseRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService extends ApiService {
  private readonly exercisesSignal = signal<Exercise[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly exercises = this.exercisesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly muscleGroups = computed(() => {
    const groups = new Set<MuscleGroup>();
    for (const exercise of this.exercisesSignal()) {
      groups.add(exercise.muscle_group);
    }
    return Array.from(groups).sort();
  });

  loadExercises() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.get<Exercise[]>('/exercises').pipe(
      tap({
        next: (exercises) => {
          this.exercisesSignal.set(exercises);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Não foi possível carregar os exercícios.');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  getById(id: string) {
    return this.get<Exercise>(`/exercises/${id}`);
  }

  create(payload: CreateExerciseRequest) {
    return this.post<Exercise, CreateExerciseRequest>('/exercises', payload).pipe(
      tap((exercise) => {
        this.exercisesSignal.update((items) => [...items, exercise]);
      }),
    );
  }

  update(id: string, payload: UpdateExerciseRequest) {
    return this.put<Exercise, UpdateExerciseRequest>(`/exercises/${id}`, payload).pipe(
      tap((exercise) => {
        this.exercisesSignal.update((items) =>
          items.map((item) => (item.id === id ? exercise : item)),
        );
      }),
    );
  }

  remove(id: string) {
    return this.delete<void>(`/exercises/${id}`).pipe(
      tap(() => {
        this.exercisesSignal.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }

  filterByTerm(term: string): Exercise[] {
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      return this.exercisesSignal();
    }

    return this.exercisesSignal().filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.muscle_group.toLowerCase().includes(normalized),
    );
  }
}
