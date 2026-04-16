import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html'
})
export class AudioPlayerComponent {
  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;
  isPlaying = false;

  togglePlay() {
    if (this.isPlaying) {
      this.audioEl.nativeElement.pause();
    } else {
      this.audioEl.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }
}
