import { Component } from '@angular/core';

@Component({
  selector: 'app-gifts',
  standalone: true,
  templateUrl: './gifts.component.html'
})
export class GiftsComponent {
  pixKey = 'telefone-ou-email-do-casal@pix.com';
  copied = false;

  copyPix() {
    navigator.clipboard.writeText(this.pixKey).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000); // Esconde a mensagem após 3s
    });
  }
}
