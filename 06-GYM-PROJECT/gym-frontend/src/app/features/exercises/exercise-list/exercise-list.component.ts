import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ExerciseService } from '../../../services/exercise.service';
import {
  MUSCLE_GROUP_OPTIONS,
  formatMuscleGroup,
} from '../../../shared/constants/exercise.constants';
import { MuscleGroup } from '../../../models';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss',
})
export class ExerciseListComponent implements OnInit {
  readonly exerciseService = inject(ExerciseService);

  readonly searchTerm = signal('');
  readonly selectedMuscleGroup = signal<MuscleGroup | ''>('');
  readonly deletingId = signal<string | null>(null);

  readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;
  readonly formatMuscleGroup = formatMuscleGroup;

  readonly filteredExercises = computed(() => {
    const byTerm = this.exerciseService.filterByTerm(this.searchTerm());
    const group = this.selectedMuscleGroup();

    if (!group) {
      return byTerm;
    }

    return byTerm.filter((exercise) => exercise.muscle_group === group);
  });

  ngOnInit(): void {
    this.exerciseService.loadExercises().subscribe();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onMuscleGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMuscleGroup.set(target.value as MuscleGroup | '');
  }

  removeExercise(id: string): void {
    if (!confirm('Deseja excluir este exercício?')) {
      return;
    }

    this.deletingId.set(id);
    this.exerciseService.remove(id).subscribe({
      complete: () => this.deletingId.set(null),
      error: () => this.deletingId.set(null),
    });
  }
}
