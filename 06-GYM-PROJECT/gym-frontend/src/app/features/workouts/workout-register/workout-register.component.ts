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
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { formatMuscleGroup } from '../../../shared/constants/exercise.constants';
import {
  INTENSITY_TYPE_OPTIONS,
  formatBlockType,
  inferBlockType,
} from '../../../shared/constants/workout.constants';
import { CreateWorkoutRequest, IntensityType } from '../../../models';

type SetForm = FormGroup<{
  reps: FormControl<number | null>;
  weight: FormControl<number | null>;
  duration_seconds: FormControl<number | null>;
  distance: FormControl<number | null>;
  intensity_type: FormControl<IntensityType>;
}>;

type ExerciseForm = FormGroup<{
  exercise_id: FormControl<string>;
  notes: FormControl<string>;
  sets: FormArray<SetForm>;
}>;

type BlockForm = FormGroup<{
  notes: FormControl<string>;
  exercises: FormArray<ExerciseForm>;
}>;

type WorkoutForm = FormGroup<{
  name: FormControl<string>;
  executed_at: FormControl<string>;
  notes: FormControl<string>;
  blocks: FormArray<BlockForm>;
}>;

type ModalTarget =
  | { type: 'exercise'; blockIndex: number }
  | { type: 'set'; blockIndex: number; exerciseIndex: number }
  | null;

@Component({
  selector: 'app-workout-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ModalComponent],
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
  readonly formatBlockType = formatBlockType;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly expandedBlocks = signal<Set<number>>(new Set([0]));
  readonly expandedExercises = signal<Set<string>>(new Set());
  readonly modalTarget = signal<ModalTarget>(null);

  modalExerciseSubtitle(): string {
    const target = this.modalTarget();
    return target?.type === 'exercise' ? `Série ${target.blockIndex + 1}` : '';
  }

  modalSetSubtitle(): string {
    const target = this.modalTarget();
    if (target?.type !== 'set') {
      return '';
    }

    const exerciseId = this.getExercises(target.blockIndex)
      .at(target.exerciseIndex)
      .controls.exercise_id.value;
    return this.exerciseName(exerciseId);
  }

  readonly modalExerciseForm = this.fb.nonNullable.group({
    exercise_id: ['', Validators.required],
    notes: [''],
  });

  readonly modalSetForm = this.fb.group({
    reps: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    weight: this.fb.control<number | null>(null, [Validators.min(0)]),
    duration_seconds: this.fb.control<number | null>(null, [Validators.min(0)]),
    distance: this.fb.control<number | null>(null, [Validators.min(0)]),
    intensity_type: this.fb.nonNullable.control<IntensityType>('REGULAR', Validators.required),
  });

  readonly form: WorkoutForm = this.fb.nonNullable.group({
    name: [''],
    executed_at: [this.toLocalDateTimeInputValue(new Date()), Validators.required],
    notes: [''],
    blocks: this.fb.array<BlockForm>([this.createBlockGroup()]),
  });

  ngOnInit(): void {
    this.exerciseService.loadExercises().subscribe();
  }

  get blocks(): FormArray<BlockForm> {
    return this.form.controls.blocks;
  }

  isBlockExpanded(index: number): boolean {
    return this.expandedBlocks().has(index);
  }

  toggleBlock(index: number): void {
    this.expandedBlocks.update((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  exerciseKey(blockIndex: number, exerciseIndex: number): string {
    return `${blockIndex}-${exerciseIndex}`;
  }

  isExerciseExpanded(blockIndex: number, exerciseIndex: number): boolean {
    return this.expandedExercises().has(this.exerciseKey(blockIndex, exerciseIndex));
  }

  toggleExercise(blockIndex: number, exerciseIndex: number): void {
    const key = this.exerciseKey(blockIndex, exerciseIndex);
    this.expandedExercises.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  getExercises(blockIndex: number): FormArray<ExerciseForm> {
    return this.blocks.at(blockIndex).controls.exercises;
  }

  getSets(blockIndex: number, exerciseIndex: number): FormArray<SetForm> {
    return this.getExercises(blockIndex).at(exerciseIndex).controls.sets;
  }

  addBlock(): void {
    const index = this.blocks.length;
    this.blocks.push(this.createBlockGroup());
    this.expandedBlocks.update((current) => new Set([...current, index]));
  }

  removeBlock(blockIndex: number): void {
    if (this.blocks.length <= 1) {
      return;
    }

    this.blocks.removeAt(blockIndex);
    this.reindexExpanded(blockIndex);
  }

  openExerciseModal(blockIndex: number): void {
    this.modalExerciseForm.reset({ exercise_id: '', notes: '' });
    this.modalTarget.set({ type: 'exercise', blockIndex });
  }

  openSetModal(blockIndex: number, exerciseIndex: number): void {
    this.modalSetForm.reset({
      reps: null,
      weight: null,
      duration_seconds: null,
      distance: null,
      intensity_type: 'REGULAR',
    });
    this.modalTarget.set({ type: 'set', blockIndex, exerciseIndex });
  }

  closeModal(): void {
    this.modalTarget.set(null);
  }

  confirmModal(): void {
    const target = this.modalTarget();
    if (!target) {
      return;
    }

    if (target.type === 'exercise') {
      if (this.modalExerciseForm.invalid) {
        this.modalExerciseForm.markAllAsTouched();
        return;
      }

      const { exercise_id, notes } = this.modalExerciseForm.getRawValue();
      const exercises = this.getExercises(target.blockIndex);
      exercises.push(this.createExerciseGroup(exercise_id, notes));
      this.toggleExercise(target.blockIndex, exercises.length - 1);
      this.closeModal();
      return;
    }

    if (this.modalSetForm.invalid) {
      this.modalSetForm.markAllAsTouched();
      return;
    }

    const setValue = this.modalSetForm.getRawValue();
    const sets = this.getSets(target.blockIndex, target.exerciseIndex);
    sets.push(this.createSetGroup(setValue));
    this.toggleExercise(target.blockIndex, target.exerciseIndex);
    this.closeModal();
  }

  removeExercise(blockIndex: number, exerciseIndex: number): void {
    const exercises = this.getExercises(blockIndex);
    if (exercises.length <= 1) {
      return;
    }

    exercises.removeAt(exerciseIndex);
    this.expandedExercises.update((current) => {
      const next = new Set<string>();
      for (const key of current) {
        const [block, exercise] = key.split('-').map(Number);
        if (block !== blockIndex) {
          next.add(key);
          continue;
        }

        if (exercise < exerciseIndex) {
          next.add(key);
        } else if (exercise > exerciseIndex) {
          next.add(`${block}-${exercise - 1}`);
        }
      }
      return next;
    });
  }

  removeSet(blockIndex: number, exerciseIndex: number, setIndex: number): void {
    const sets = this.getSets(blockIndex, exerciseIndex);
    if (sets.length <= 1) {
      return;
    }

    sets.removeAt(setIndex);
  }

  exerciseName(exerciseId: string): string {
    return (
      this.exerciseService.exercises().find((exercise) => exercise.id === exerciseId)?.name ??
      'Exercício'
    );
  }

  blockSummary(blockIndex: number): string {
    const exercises = this.getExercises(blockIndex).controls;
    if (!exercises.length) {
      return 'Sem exercícios';
    }

    return exercises
      .map((exercise) => this.exerciseName(exercise.controls.exercise_id.value))
      .join(' + ');
  }

  blockTypeLabel(blockIndex: number): string {
    const count = this.getExercises(blockIndex).length;
    return formatBlockType(inferBlockType(count));
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      executed_at: this.toLocalDateTimeInputValue(new Date()),
      notes: '',
    });
    this.blocks.clear();
    this.blocks.push(this.createBlockGroup());
    this.expandedBlocks.set(new Set([0]));
    this.expandedExercises.set(new Set());
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.closeModal();
  }

  submit(): void {
    if (!this.isWorkoutValid()) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Preencha ao menos uma série com exercícios e cargas válidas.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { name, executed_at, notes, blocks } = this.form.getRawValue();

    const payload: CreateWorkoutRequest = {
      name: name.trim() || null,
      notes: notes.trim() || null,
      is_template: false,
      executed_at: new Date(executed_at).toISOString(),
      blocks: blocks.map((block, blockIndex) => {
        const exercises = block.exercises ?? [];
        return {
          sequence: blockIndex + 1,
          block_type: inferBlockType(exercises.length),
          notes: block.notes?.trim() || null,
          exercises: exercises.map((exercise, exerciseIndex) => ({
            exercise_id: exercise.exercise_id,
            sequence: exerciseIndex + 1,
            notes: exercise.notes?.trim() || null,
            sets: (exercise.sets ?? []).map((set, setIndex) => ({
              sequence: setIndex + 1,
              reps: set.reps,
              weight: set.weight,
              duration_seconds: set.duration_seconds,
              distance: set.distance,
              intensity_type: set.intensity_type,
            })),
          })),
        };
      }),
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

  private isWorkoutValid(): boolean {
    if (this.form.controls.executed_at.invalid) {
      return false;
    }

    if (!this.blocks.length) {
      return false;
    }

    return this.blocks.controls.every((block) => {
      const exercises = block.controls.exercises.controls;
      if (!exercises.length) {
        return false;
      }

      return exercises.every((exercise) => {
        if (!exercise.controls.exercise_id.value) {
          return false;
        }

        const sets = exercise.controls.sets.controls;
        if (!sets.length) {
          return false;
        }

        return sets.every((set) => set.controls.reps.valid);
      });
    });
  }

  private createBlockGroup(): BlockForm {
    return this.fb.group({
      notes: this.fb.nonNullable.control(''),
      exercises: this.fb.array<ExerciseForm>([]),
    });
  }

  private createExerciseGroup(exerciseId = '', notes = ''): ExerciseForm {
    return this.fb.group({
      exercise_id: this.fb.nonNullable.control(exerciseId, Validators.required),
      notes: this.fb.nonNullable.control(notes),
      sets: this.fb.array<SetForm>([]),
    });
  }

  private createSetGroup(
    values?: Partial<{
      reps: number | null;
      weight: number | null;
      duration_seconds: number | null;
      distance: number | null;
      intensity_type: IntensityType;
    }>,
  ): SetForm {
    return this.fb.group({
      reps: this.fb.control<number | null>(values?.reps ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
      weight: this.fb.control<number | null>(values?.weight ?? null, [Validators.min(0)]),
      duration_seconds: this.fb.control<number | null>(values?.duration_seconds ?? null, [
        Validators.min(0),
      ]),
      distance: this.fb.control<number | null>(values?.distance ?? null, [Validators.min(0)]),
      intensity_type: this.fb.nonNullable.control<IntensityType>(
        values?.intensity_type ?? 'REGULAR',
        Validators.required,
      ),
    });
  }

  private reindexExpanded(removedBlockIndex: number): void {
    this.expandedBlocks.update((current) => {
      const next = new Set<number>();
      for (const index of current) {
        if (index < removedBlockIndex) {
          next.add(index);
        } else if (index > removedBlockIndex) {
          next.add(index - 1);
        }
      }
      if (!next.size && this.blocks.length) {
        next.add(0);
      }
      return next;
    });

    this.expandedExercises.update((current) => {
      const next = new Set<string>();
      for (const key of current) {
        const [block, exercise] = key.split('-').map(Number);
        if (block < removedBlockIndex) {
          next.add(key);
        } else if (block > removedBlockIndex) {
          next.add(`${block - 1}-${exercise}`);
        }
      }
      return next;
    });
  }

  private toLocalDateTimeInputValue(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
