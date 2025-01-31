import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Localization } from './_framework/component/helpers/localization';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from './adv-list/adv-list.helper';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [DatePipe, AdvListHelper],
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
