import { Component, HostListener } from '@angular/core';
import {
  StoryPhotoCollageComponent,
  type StoryPhoto,
} from './photo-collage/photo-collage.component';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [StoryPhotoCollageComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class StoryComponent {
  /** Três fotos do bloco “O Primeiro Encontro” (`src/assets/images/`). */
  primeiroEncontroFotos: StoryPhoto[] = [
    { src: 'assets/images/first-date/first-date1.jpg', alt: 'Como nos conhecemos' },
    { src: 'assets/images/first-date/first-date2.jpg', alt: 'Primeiros momentos' },
    { src: 'assets/images/first-date/first-date3.jpg', alt: 'Memórias do começo' },
  ];

  pedidoFoto: StoryPhoto = {
    src: 'assets/images/the-proposal/proposal.jpg',
    alt: 'O Pedido',
  };

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
