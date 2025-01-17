import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  isDevMode,
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
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ngRxTestEntityStore } from './ngrx-test/ngrxTest/ngRxTestEntity.store';
import { NgRxTestEntityService } from './ngrx-test/ngrxTest/ngRxTestEntity.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
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
    ngRxTestEntityStore,
    NgRxTestEntityService,
  ],
};
