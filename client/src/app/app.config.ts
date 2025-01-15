import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  isDevMode,
  APP_INITIALIZER,
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
import { metaReducers, reducers } from './reducers';
import { TestResolver } from './ngrx-test/test.resolver';
import {
  EntityDataModuleConfig,
  EntityDataService,
  EntityMetadataMap,
  provideEntityData,
  withEffects,
} from '@ngrx/data';
import { TestEntityService } from './ngrx-test/services/test-entity.service';
import { TestDataService } from './ngrx-test/services/test-data.service';

//New
const entityMetadata: EntityMetadataMap = {
  NgRxTestEntity: {},
};
//New
export const entityConfig: EntityDataModuleConfig = {
  entityMetadata,
};

export function registerTestDataService(
  entityDataService: EntityDataService,
  testDataService: TestDataService
): () => Promise<void> {
  return () =>
    new Promise<void>((resolve) => {
      console.log('>>> registerTestDataService() called');
      entityDataService.registerService('NgRxTestEntity', testDataService);
      resolve(); 
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    TestDataService,
    {
      provide: APP_INITIALIZER,
      useFactory: registerTestDataService,
      deps: [EntityDataService, TestDataService],
      multi: true,
    },
    provideRouter(routes),
    provideEntityData(entityConfig, withEffects()),

    //TestResolver,
    TestEntityService,
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
    //New

    // provideRouterStore({
    //   stateKey: 'router',
    //   routerState: RouterState.Full,
    // }),
  ],
};
