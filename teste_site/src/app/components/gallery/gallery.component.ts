import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html'
})
export class GalleryComponent {
  // Em que pasta que coloco as fotos?
  images = [
    'assets/images/galeria1.jpg',
    'assets/images/galeria2.jpg',
    'assets/images/galeria3.jpg',
    'assets/images/galeria4.jpg',
    'assets/images/galeria5.jpg',
    'assets/images/galeria6.jpg'
  ];

  selectedImage: string | null = null;

  openLightbox(img: string) {
    this.selectedImage = img;
    document.body.style.overflow = 'hidden'; // Evita que a página role enquanto a foto está aberta
  }

  closeLightbox() {
    this.selectedImage = null;
    document.body.style.overflow = 'auto'; // Devolve a rolagem da página
  }
}
