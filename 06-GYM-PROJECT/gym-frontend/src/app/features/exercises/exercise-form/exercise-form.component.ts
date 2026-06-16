import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ExerciseService } from '../../../services/exercise.service';
import { MUSCLE_GROUP_OPTIONS } from '../../../shared/constants/exercise.constants';
import { Exercise } from '../../../models';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './exercise-form.component.html',
  styleUrl: './exercise-form.component.scss',
})
export class ExerciseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly exerciseService = inject(ExerciseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;
  readonly isEditing = signal(false);
  readonly loadingExercise = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private exerciseId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    muscle_group: this.fb.nonNullable.control(
      MUSCLE_GROUP_OPTIONS[0].value,
      Validators.required,
    ),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.exerciseId = id;
    this.isEditing.set(true);
    this.loadingExercise.set(true);

    this.exerciseService.getById(id).subscribe({
      next: (exercise) => {
        this.form.patchValue({
          name: exercise.name,
          muscle_group: exercise.muscle_group,
        });
        this.loadingExercise.set(false);
      },
      error: () => {
        this.errorMessage.set('Exercício não encontrado.');
        this.loadingExercise.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();
    const request$ = this.isEditing() && this.exerciseId
      ? this.exerciseService.update(this.exerciseId, payload)
      : this.exerciseService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/exercises']);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Não foi possível salvar o exercício.');
      },
    });
  }
}
