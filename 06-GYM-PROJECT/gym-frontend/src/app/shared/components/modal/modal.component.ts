import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        (click)="onBackdrop($event)"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div
          class="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-white">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="mt-1 text-sm text-slate-400">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Fechar"
              (click)="close.emit()"
            >
              ✕
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');

  readonly close = output<void>();

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
