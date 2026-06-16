import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';

import { ExerciseExecutionService } from '../../../services/exercise-execution.service';
import { ExerciseService } from '../../../services/exercise.service';
import { SetExecutionService } from '../../../services/set-execution.service';
import { SetInformationService } from '../../../services/set-information.service';
import {
  INTENSITY_TYPE_OPTIONS,
  formatMuscleGroup,
} from '../../../shared/constants/exercise.constants';
import { IntensityType } from '../../../models';

interface SetInformationValue {
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  distance: number | null;
}

interface SetValue {
  intensity_type: IntensityType;
  informations: SetInformationValue[];
}

interface WorkoutFormValue {
  exercise_id: string;
  executed_at: string;
  notes: string;
  sets: SetValue[];
}

type SetInformationForm = FormGroup<{
  reps: FormControl<number | null>;
  weight: FormControl<number | null>;
  duration_seconds: FormControl<number | null>;
  distance: FormControl<number | null>;
}>;

type SetForm = FormGroup<{
  intensity_type: FormControl<IntensityType>;
  informations: FormArray<SetInformationForm>;
}>;

@Component({
  selector: 'app-workout-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './workout-register.component.html',
  styleUrl: './workout-register.component.scss',
})
export class WorkoutRegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly exerciseService = inject(ExerciseService);
  private readonly exerciseExecutionService = inject(ExerciseExecutionService);
  private readonly setExecutionService = inject(SetExecutionService);
  private readonly setInformationService = inject(SetInformationService);

  readonly intensityTypeOptions = INTENSITY_TYPE_OPTIONS;
  readonly formatMuscleGroup = formatMuscleGroup;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
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

  getInformations(setIndex: number): FormArray<SetInformationForm> {
    return this.sets.at(setIndex).controls.informations;
  }

  addSet(): void {
    this.sets.push(this.createSetGroup());
  }

  removeSet(index: number): void {
    this.sets.removeAt(index);
  }

  addSetInformation(setIndex: number): void {
    this.getInformations(setIndex).push(this.createSetInformationGroup());
  }

  removeSetInformation(setIndex: number, infoIndex: number): void {
    this.getInformations(setIndex).removeAt(infoIndex);
  }

  resetForm(): void {
    this.form.reset({
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

    const { exercise_id, executed_at, notes, sets } =
      this.form.getRawValue() as WorkoutFormValue;

    this.exerciseExecutionService
      .create({
        exercise_id,
        executed_at: new Date(executed_at).toISOString(),
        notes: notes || null,
      })
      .pipe(
        switchMap((execution) => {
          const setRequests = sets.map((set, index) =>
            this.setExecutionService
              .create({
                exercise_execution_id: execution.id,
                sequence: index + 1,
                intensity_type: set.intensity_type,
              })
              .pipe(
                switchMap((setExecution) => {
                  const infoRequests = set.informations.map((info) =>
                    this.setInformationService.create({
                      set_execution_id: setExecution.id,
                      reps: info.reps,
                      weight: info.weight,
                      duration_seconds: info.duration_seconds,
                      distance: info.distance,
                    }),
                  );

                  return forkJoin(infoRequests);
                }),
              ),
          );

          return forkJoin(setRequests);
        }),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Treino registrado com sucesso!');
          this.resetForm();
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível registrar o treino. Verifique a API.');
        },
      });
  }

  private createSetGroup(): SetForm {
    return this.fb.group({
      intensity_type: this.fb.nonNullable.control<IntensityType>('weight', Validators.required),
      informations: this.fb.array<SetInformationForm>([this.createSetInformationGroup()]),
    });
  }

  private createSetInformationGroup(): SetInformationForm {
    return this.fb.group({
      reps: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      weight: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      duration_seconds: this.fb.control<number | null>(null),
      distance: this.fb.control<number | null>(null),
    });
  }

  private toLocalDateTimeInputValue(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
