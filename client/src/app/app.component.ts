import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Localization } from './_framework/component/helpers/localization';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  Localization = Localization;
  router = inject(Router);
  title = 'Chatbot';

  constructor() {
    this.Localization.setLanguage(
      window.Telegram.WebApp.initDataUnsafe?.user?.language_code ?? 'en'
    );
  }

}
