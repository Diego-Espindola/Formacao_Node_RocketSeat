import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { StoryComponent } from './components/story/story.component';
import { EventInfoComponent } from './components/event-info/event-info.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { GiftsComponent } from './components/gifts/gifts.component';
import { RsvpComponent } from './components/rsvp/rsvp.component';
import { FooterComponent } from './components/footer/footer.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    StoryComponent,
    EventInfoComponent,
    CountdownComponent,
    GiftsComponent,
    RsvpComponent,
    FooterComponent,
    GalleryComponent,
    AudioPlayerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'site-casamento';

  ngOnInit() {
    // Inicializa as animações de scroll, se for utilizar o AOS
    AOS.init({
      duration: 1000,
      once: true
    });
  }
}
