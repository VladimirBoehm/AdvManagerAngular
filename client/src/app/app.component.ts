import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Localization } from './_framework/component/helpers/localization';
import { DatePipe } from '@angular/common';
import { AdvListHelper } from './adv-list/adv-list.helper';
import { SignalRService } from './_services/signalRService';
import { lastValueFrom } from 'rxjs';
import { AccountService } from './_services/api.services/account.service';
import { patchState } from '@ngrx/signals';
import { AppStore } from './appStore/app.store';
import { TurtleLoader } from './_framework/component/loaders/turtle-loader/turtle-loader';
import { environment } from '../environments/environment';
import { LOCAL_STORAGE_CONSTANTS } from './_framework/constants/localStorageConstants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TurtleLoader],
  providers: [DatePipe, AdvListHelper],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  Localization = Localization;
  router = inject(Router);
  signalRService = inject(SignalRService);
  readonly accountService = inject(AccountService);
  readonly appStore = inject(AppStore);
  title = 'Chatbot';
  isLoading = signal(true);

  async ngOnInit() {
    const startTime = Date.now();

    const loginResponse = await lastValueFrom(this.accountService.login());
    console.log('received loginResponse');
    localStorage.setItem(
      LOCAL_STORAGE_CONSTANTS.USER,
      JSON.stringify(loginResponse.data.user)
    );
    localStorage.setItem(
      LOCAL_STORAGE_CONSTANTS.JWT_TOKEN,
      loginResponse.data.jwtToken
    );
    patchState(this.appStore as any, { user: loginResponse.data.user });
    console.log('patchState completed');
    this.Localization.setLanguage(
      window.Telegram.WebApp.initDataUnsafe?.user?.language_code ?? 'en'
    );
    await this.signalRService.createHubConnection();
    console.log('HubConnection completed');

    //to show pretty loader :)
    const elapsed = Date.now() - startTime;
    const minDelay = 1750;
    const maxDelay = 3500;
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;

    if (elapsed < randomDelay && environment.isProd) {
      await new Promise((resolve) =>
        setTimeout(resolve, randomDelay - elapsed)
      );
    }

    this.isLoading.set(false);
  }
}
