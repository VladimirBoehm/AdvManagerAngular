import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { telegramInitDataInterceptor } from './_interceptors/telegram-init-data.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ModalModule } from 'ngx-bootstrap/modal';
import { loadingInterceptor } from './_interceptors/loading.interceptor';
import { errorInterceptor } from './_interceptors/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        telegramInitDataInterceptor,
        loadingInterceptor,
      ])
    ),
    provideAnimationsAsync(),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-full-width',
    }),
    importProvidersFrom(ModalModule.forRoot()),
  ],
};
