import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { WorkoutService } from '../../../services/workout.service';
import {
  countWorkoutExercises,
  countWorkoutSets,
  formatBlockType,
  formatExecutedAt,
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
  readonly expandedId = signal<string | null>(null);

  readonly formatExecutedAt = formatExecutedAt;
  readonly formatBlockType = formatBlockType;
  readonly formatSetSummary = formatSetSummary;
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

  toggleExpanded(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  workoutTitle(workout: Workout): string {
    return workout.name ?? `Treino em ${formatExecutedAt(workout.executed_at)}`;
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
