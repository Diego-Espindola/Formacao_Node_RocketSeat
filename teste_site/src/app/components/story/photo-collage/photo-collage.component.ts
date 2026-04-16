import { Component, HostListener, Input } from '@angular/core';

export type StoryPhoto = { src: string; alt: string };

@Component({
  selector: 'app-story-photo-collage',
  standalone: true,
  templateUrl: './photo-collage.component.html',
  styleUrl: './photo-collage.component.scss',
})
export class StoryPhotoCollageComponent {
  @Input({ required: true }) fotos!: StoryPhoto[];

  lightbox: StoryPhoto | null = null;

  openLightbox(foto: StoryPhoto): void {
    this.lightbox = foto;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightbox = null;
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.lightbox) {
      this.closeLightbox();
    }
  }
}
