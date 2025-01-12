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
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { RouterState } from '@ngrx/router-store';
import { metaReducers, reducers } from './reducers';
import {provideEntityData, withEffects} from '@ngrx/data';
import { entityConfig } from './entity-metadata';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
        errorInterceptor,
        telegramInitDataInterceptor,
        loadingInterceptor,
    ])),
    provideAnimationsAsync(),
    provideAnimations(),
    provideToastr({
        positionClass: 'toast-top-full-width',
    }),
    importProvidersFrom(ModalModule.forRoot()),
    provideStore(reducers, {
        metaReducers,
        runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
            strictActionSerializability: true,
            strictStateSerializability: true,
        },
    }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore({
        stateKey: 'router',
        routerState: RouterState.Minimal,
    }),
    provideEntityData(entityConfig, withEffects())
],
};
