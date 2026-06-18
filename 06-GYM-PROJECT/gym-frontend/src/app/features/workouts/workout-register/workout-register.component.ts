import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ExerciseService } from '../../../services/exercise.service';
import { WorkoutService } from '../../../services/workout.service';
import { formatMuscleGroup } from '../../../shared/constants/exercise.constants';
import {
  INTENSITY_TYPE_OPTIONS,
} from '../../../shared/constants/workout.constants';
import { CreateWorkoutRequest, IntensityType } from '../../../models';

interface SetValue {
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  distance: number | null;
  intensity_type: IntensityType;
}

interface WorkoutFormValue {
  name: string;
  exercise_id: string;
  executed_at: string;
  notes: string;
  sets: SetValue[];
}

type SetForm = FormGroup<{
  reps: FormControl<number | null>;
  weight: FormControl<number | null>;
  duration_seconds: FormControl<number | null>;
  distance: FormControl<number | null>;
  intensity_type: FormControl<IntensityType>;
}>;

@Component({
  selector: 'app-workout-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './workout-register.component.html',
  styleUrl: './workout-register.component.scss',
})
export class WorkoutRegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly exerciseService = inject(ExerciseService);
  private readonly workoutService = inject(WorkoutService);

  readonly intensityTypeOptions = INTENSITY_TYPE_OPTIONS;
  readonly formatMuscleGroup = formatMuscleGroup;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    exercise_id: ['', Validators.required],
    executed_at: [this.toLocalDateTimeInputValue(new Date()), Validators.required],
    notes: [''],
    sets: this.fb.array<SetForm>([this.createSetGroup()]),
  });

  ngOnInit(): void {
    this.exerciseService.loadExercises().subscribe();
  }

  get sets(): FormArray<SetForm> {
    return this.form.controls.sets;
  }

  addSet(): void {
    this.sets.push(this.createSetGroup());
  }

  removeSet(index: number): void {
    this.sets.removeAt(index);
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      exercise_id: '',
      executed_at: this.toLocalDateTimeInputValue(new Date()),
      notes: '',
    });
    this.sets.clear();
    this.sets.push(this.createSetGroup());
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { name, exercise_id, executed_at, notes, sets } =
      this.form.getRawValue() as WorkoutFormValue;

    const selectedExercise = this.exerciseService
      .exercises()
      .find((exercise) => exercise.id === exercise_id);

    const payload: CreateWorkoutRequest = {
      name: name.trim() || selectedExercise?.name || null,
      notes: notes.trim() || null,
      is_template: false,
      executed_at: new Date(executed_at).toISOString(),
      blocks: [
        {
          sequence: 1,
          block_type: 'SINGLE',
          exercises: [
            {
              exercise_id,
              sequence: 1,
              sets: sets.map((set, index) => ({
                sequence: index + 1,
                reps: set.reps,
                weight: set.weight,
                duration_seconds: set.duration_seconds,
                distance: set.distance,
                intensity_type: set.intensity_type,
              })),
            },
          ],
        },
      ],
    };

    this.workoutService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Treino registrado com sucesso!');
        this.resetForm();
        void this.router.navigate(['/workouts/history']);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Não foi possível registrar o treino. Verifique a API.');
      },
    });
  }

  private createSetGroup(): SetForm {
    return this.fb.group({
      reps: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      weight: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      duration_seconds: this.fb.control<number | null>(null),
      distance: this.fb.control<number | null>(null),
      intensity_type: this.fb.nonNullable.control<IntensityType>('REGULAR', Validators.required),
    });
  }

  private toLocalDateTimeInputValue(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
