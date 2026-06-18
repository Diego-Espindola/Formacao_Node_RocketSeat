import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { WorkoutService } from '../../../services/workout.service';
import {
  countWorkoutExercises,
  countWorkoutSets,
  formatBlockType,
  formatExecutedAt,
  formatIntensityType,
  formatSetSummary,
} from '../../../shared/constants/workout.constants';
import { Workout } from '../../../models';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './workout-history.component.html',
  styleUrl: './workout-history.component.scss',
})
export class WorkoutHistoryComponent implements OnInit {
  readonly workoutService = inject(WorkoutService);

  readonly searchTerm = signal('');
  readonly expandedWorkouts = signal<Set<string>>(new Set());
  readonly expandedBlocks = signal<Set<string>>(new Set());
  readonly expandedExercises = signal<Set<string>>(new Set());

  readonly formatExecutedAt = formatExecutedAt;
  readonly formatBlockType = formatBlockType;
  readonly formatSetSummary = formatSetSummary;
  readonly formatIntensityType = formatIntensityType;
  readonly countExercises = countWorkoutExercises;
  readonly countSets = countWorkoutSets;

  readonly filteredWorkouts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const workouts = this.workoutService.workouts();

    if (!term) {
      return workouts;
    }

    return workouts.filter((workout) => this.matchesSearch(workout, term));
  });

  ngOnInit(): void {
    this.workoutService.loadExecutedWorkouts().subscribe();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  blockKey(workoutId: string, blockId: string): string {
    return `${workoutId}:${blockId}`;
  }

  exerciseKey(workoutId: string, blockId: string, exerciseId: string): string {
    return `${workoutId}:${blockId}:${exerciseId}`;
  }

  isWorkoutExpanded(id: string): boolean {
    return this.expandedWorkouts().has(id);
  }

  toggleWorkout(id: string): void {
    this.toggleSet(this.expandedWorkouts, id);
  }

  isBlockExpanded(workoutId: string, blockId: string): boolean {
    return this.expandedBlocks().has(this.blockKey(workoutId, blockId));
  }

  toggleBlock(workoutId: string, blockId: string): void {
    this.toggleSet(this.expandedBlocks, this.blockKey(workoutId, blockId));
  }

  isExerciseExpanded(workoutId: string, blockId: string, exerciseId: string): boolean {
    return this.expandedExercises().has(this.exerciseKey(workoutId, blockId, exerciseId));
  }

  toggleExercise(workoutId: string, blockId: string, exerciseId: string): void {
    this.toggleSet(this.expandedExercises, this.exerciseKey(workoutId, blockId, exerciseId));
  }

  workoutTitle(workout: Workout): string {
    return workout.name ?? `Treino em ${formatExecutedAt(workout.executed_at)}`;
  }

  private toggleSet(target: { update: (fn: (current: Set<string>) => Set<string>) => void }, key: string): void {
    target.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  private matchesSearch(workout: Workout, term: string): boolean {
    if (this.workoutTitle(workout).toLowerCase().includes(term)) {
      return true;
    }

    if (workout.notes?.toLowerCase().includes(term)) {
      return true;
    }

    return workout.blocks.some((block) =>
      block.exercises.some((item) => item.exercise?.name.toLowerCase().includes(term)),
    );
  }
}
