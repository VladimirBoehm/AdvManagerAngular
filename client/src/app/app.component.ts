import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Localization } from './_framework/component/helpers/localization';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from './adv-list/adv-list.helper';
import { SignalRService } from './_services/signalRService';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [DatePipe, AdvListHelper],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  Localization = Localization;
  router = inject(Router);
  signalRService = inject(SignalRService);
  title = 'Chatbot';
  constructor() {
    this.Localization.setLanguage(
      window.Telegram.WebApp.initDataUnsafe?.user?.language_code ?? 'en'
    );
  }
  async ngOnInit() {
    await this.initializeHubConnection();
  }

  async initializeHubConnection() {
    if (environment.isLocal) {
      this.signalRService.createHubConnection();
      return;
    }
    while (!window?.Telegram?.WebApp?.initData) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.signalRService.createHubConnection();
  }
}
